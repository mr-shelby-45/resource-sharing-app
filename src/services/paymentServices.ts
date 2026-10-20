// Payments: collect from the borrower, pay the owner on return, refund on cancel.
// Statuses live on the Payment row; the booking keeps its normal lifecycle.
import { prisma } from '@/lib/prisma'
import { User } from '@/generated/prisma/client'
import { AppError, assertAllowed } from '@/lib/errors'
import { todayInNairobi } from '@/lib/dates'
import {
  PAYMENT_WINDOW_HOURS, amountDue, canPayBooking, fromSubunit, isValidWebhookSignature,
  newReference, normaliseKenyanPhone, payState,
} from '@/lib/payments'
import {
  createMpesaRecipient, initializeTransaction, initiateTransfer, refundTransaction, verifyTransaction,
} from '@/lib/paystack'

export const UNPAID_NOTE = 'Cancelled: the borrower did not pay in time.'

// Approved bookings that were not paid within the window are cancelled so the dates open up again.
// Runs when pages and payment calls load, so no scheduler is needed.
export async function expireUnpaidBookings(now: Date = new Date()) {
  const cutoff = new Date(now.getTime() - PAYMENT_WINDOW_HOURS * 60 * 60 * 1000)
  const stale = await prisma.booking.findMany({
    where: { status: 'APPROVED', approvedAt: { lt: cutoff }, OR: [{ payment: null }, { payment: { status: { not: 'PAID' } } }] },
  })
  const ids = stale.filter(b => amountDue(b) > 0).map(b => b.id)
  if (ids.length === 0) return 0
  const { count } = await prisma.booking.updateMany({
    where: { id: { in: ids }, status: 'APPROVED' },
    data: { status: 'CANCELLED', decisionNote: UNPAID_NOTE },
  })
  return count
}

// 1. borrower pays: returns the Paystack checkout address to send them to
export async function startPayment(user: User, bookingId: number, origin: string) {
  await expireUnpaidBookings()
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { item: true, payment: true } })
  if (!booking) throw new AppError(404, 'Booking not found')

  const state = payState(booking, booking.payment)
  assertAllowed(canPayBooking(user, booking, state, todayInNairobi()))

  const amount = amountDue(booking)
  // every attempt gets its own reference, so a retry after a failed or abandoned try is a fresh transaction
  const reference = newReference('PAY', booking.id)
  await prisma.payment.upsert({
    where: { bookingId: booking.id },
    create: { bookingId: booking.id, amount, reference },
    update: { amount, reference, status: 'PENDING' },
  })

  const tx = await initializeTransaction({
    email: user.email,
    amountKes: amount,
    reference,
    callbackUrl: `${origin}/payments/callback`,
    metadata: { bookingId: booking.id, item: booking.item.title },
  })
  return { url: tx.authorization_url, reference }
}

// 2. Paystack tells us it was paid (callback page or webhook). We never trust the caller: we ask Paystack.
export async function confirmPayment(reference: string) {
  const payment = await prisma.payment.findUnique({ where: { reference }, include: { booking: true } })
  if (!payment) throw new AppError(404, 'Payment not found')
  if (payment.status === 'PAID') return payment

  const tx = await verifyTransaction(reference)
  if (tx.status === 'failed') {
    await prisma.payment.updateMany({ where: { id: payment.id, status: 'PENDING' }, data: { status: 'FAILED' } })
    return prisma.payment.findUniqueOrThrow({ where: { id: payment.id } })
  }
  if (tx.status !== 'success') return payment   // still pending or abandoned

  if (tx.currency !== 'KES' || fromSubunit(tx.amount) !== payment.amount) {
    console.error('Payment amount mismatch', reference, tx.amount, tx.currency)
    throw new AppError(409, 'The amount paid does not match the booking')
  }

  // idempotent: only the first confirmation flips the row, webhook retries do nothing
  const { count } = await prisma.payment.updateMany({
    where: { id: payment.id, status: { not: 'PAID' } },
    data: { status: 'PAID', paidAt: new Date(), channel: tx.channel },
  })
  // money arrived for a booking that was cancelled or expired in the meantime: give it back
  if (count === 1 && payment.booking.status !== 'APPROVED') {
    await refundPayment(payment.bookingId).catch(e => console.error('Auto refund failed', e))
  }
  return prisma.payment.findUniqueOrThrow({ where: { id: payment.id } })
}

// 3. owner payout, started when the item is marked returned
export async function payOwner(bookingId: number) {
  const payment = await prisma.payment.findUnique({
    where: { bookingId },
    include: { booking: { include: { item: { include: { owner: true } } } } },
  })
  if (!payment || payment.status !== 'PAID') return null

  // claim the payout so two clicks or two requests cannot send the money twice
  const payoutReference = newReference('OUT', bookingId)
  const claimed = await prisma.payment.updateMany({
    where: { id: payment.id, payoutStatus: { in: ['NONE', 'FAILED'] }, refundStatus: 'NONE' },
    data: { payoutStatus: 'PENDING', payoutReference, payoutNote: null },
  })
  if (claimed.count !== 1) return null

  const owner = payment.booking.item.owner
  const fail = (note: string) =>
    prisma.payment.update({ where: { id: payment.id }, data: { payoutStatus: 'FAILED', payoutNote: note } })

  const phone = normaliseKenyanPhone(owner.phone)
  if (!phone) return fail('The owner phone number is not a valid M-Pesa number.')

  try {
    let recipientCode = owner.recipientPhone === phone ? owner.recipientCode : null
    if (!recipientCode) {
      const recipient = await createMpesaRecipient({ name: owner.name, phone })
      recipientCode = recipient.recipient_code
      await prisma.user.update({ where: { id: owner.id }, data: { recipientCode, recipientPhone: phone } })
    }
    const transfer = await initiateTransfer({
      amountKes: payment.amount,
      recipientCode,
      reference: payoutReference,
      reason: `Jirani booking #${bookingId}: ${payment.booking.item.title}`,
    })
    if (transfer.status === 'otp') {
      return fail('Paystack wants an OTP for this transfer. Turn off transfer OTP in the Paystack dashboard.')
    }
    if (transfer.status === 'success') {
      return prisma.payment.update({ where: { id: payment.id }, data: { payoutStatus: 'SUCCESS', paidOutAt: new Date() } })
    }
    return prisma.payment.findUniqueOrThrow({ where: { id: payment.id } })   // pending, the webhook settles it
  } catch (error) {
    return fail(error instanceof AppError ? error.message : 'The payout could not be started.')
  }
}

// the owner (or an admin) tries a failed payout again
export async function retryPayout(user: User, bookingId: number) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { item: true, payment: true } })
  if (!booking) throw new AppError(404, 'Booking not found')
  if (booking.item.ownerId !== user.id && !user.isAdmin) throw new AppError(403, 'Only the item owner can retry this payout')
  if (booking.status !== 'RETURNED' || booking.payment?.payoutStatus !== 'FAILED') {
    throw new AppError(409, 'There is no failed payout to retry')
  }
  return payOwner(bookingId)
}

// 4. refund the borrower in full (cancelled before the start date)
export async function refundPayment(bookingId: number) {
  const payment = await prisma.payment.findUnique({ where: { bookingId } })
  if (!payment || payment.status !== 'PAID') return null

  const claimed = await prisma.payment.updateMany({
    where: { id: payment.id, refundStatus: { in: ['NONE', 'FAILED'] }, payoutStatus: 'NONE' },
    data: { refundStatus: 'PENDING', refundNote: null },
  })
  if (claimed.count !== 1) return null

  try {
    const refund = await refundTransaction(payment.reference)
    const done = refund.status === 'processed'
    return prisma.payment.update({
      where: { id: payment.id },
      data: done ? { refundStatus: 'SUCCESS', refundedAt: new Date() } : { refundStatus: 'PENDING' },
    })
  } catch (error) {
    return prisma.payment.update({
      where: { id: payment.id },
      data: { refundStatus: 'FAILED', refundNote: error instanceof AppError ? error.message : 'The refund could not be started.' },
    })
  }
}

// 5. Paystack calls us when something changes. The signature proves it is really Paystack.
export async function handleWebhook(rawBody: string, signature: string | null) {
  if (!isValidWebhookSignature(rawBody, signature, process.env.PAYSTACK_SECRET_KEY ?? '')) {
    throw new AppError(401, 'Invalid signature')
  }
  const { event, data } = JSON.parse(rawBody) as { event: string; data: Record<string, unknown> }
  const reference = String(data.reference ?? '')

  switch (event) {
    case 'charge.success':
      await confirmPayment(reference).catch(e => console.error('Webhook confirm failed', reference, e))
      break
    case 'transfer.success':
      await prisma.payment.updateMany({
        where: { payoutReference: reference, payoutStatus: { not: 'SUCCESS' } },
        data: { payoutStatus: 'SUCCESS', paidOutAt: new Date(), payoutNote: null },
      })
      break
    case 'transfer.failed':
    case 'transfer.reversed':
      await prisma.payment.updateMany({
        where: { payoutReference: reference },
        data: { payoutStatus: 'FAILED', payoutNote: String(data.reason ?? 'The transfer failed or was reversed.') },
      })
      break
    case 'refund.processed':
      await prisma.payment.updateMany({
        where: { reference: String(data.transaction_reference ?? ''), refundStatus: { not: 'SUCCESS' } },
        data: { refundStatus: 'SUCCESS', refundedAt: new Date() },
      })
      break
    case 'refund.failed':
      await prisma.payment.updateMany({
        where: { reference: String(data.transaction_reference ?? '') },
        data: { refundStatus: 'FAILED', refundNote: 'The refund failed. Contact support.' },
      })
      break
  }
}
