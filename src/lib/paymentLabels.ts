// The one line of payment status shown on a booking row. Pure, so it is easy to test.
import { amountDue, paymentDeadline, payState } from '@/lib/payments'

type PaymentLike = {
  status: string
  payoutStatus: string
  payoutNote: string | null
  refundStatus: string
  refundNote: string | null
} | null

type BookingLike = {
  status: string
  dailyRate: number
  startDate: Date
  endDate: Date
  approvedAt: Date | null
}

export type PaymentNote = { text: string; tone: 'ok' | 'wait' | 'bad' }

const kes = (n: number) => `KES ${n.toLocaleString('en-KE')}`

const formatDeadline = (d: Date) =>
  d.toLocaleString('en-GB', { timeZone: 'Africa/Nairobi', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export function paymentNote(
  role: 'borrower' | 'owner',
  booking: BookingLike,
  payment: PaymentLike,
  now: Date = new Date()
): PaymentNote | null {
  const amount = amountDue(booking)
  if (amount === 0) return null

  if (booking.status === 'APPROVED') {
    const state = payState(booking, payment, now)
    if (state === 'PAID') {
      return role === 'borrower'
        ? { text: `Paid ${kes(amount)}`, tone: 'ok' }
        : { text: `Paid by the borrower. ${kes(amount)} goes to your M-Pesa when you mark it returned.`, tone: 'ok' }
    }
    const by = booking.approvedAt ? ` by ${formatDeadline(paymentDeadline(booking.approvedAt))}` : ''
    return role === 'borrower'
      ? { text: `Pay ${kes(amount)}${by} or the booking is cancelled`, tone: 'wait' }
      : { text: `Waiting for the borrower to pay ${kes(amount)}${by}`, tone: 'wait' }
  }

  if (booking.status === 'RETURNED' && payment?.status === 'PAID') {
    if (role === 'borrower') return { text: `Paid ${kes(amount)}`, tone: 'ok' }
    switch (payment.payoutStatus) {
      case 'SUCCESS': return { text: `${kes(amount)} paid out to your M-Pesa`, tone: 'ok' }
      case 'PENDING': return { text: `Payout of ${kes(amount)} is on its way`, tone: 'wait' }
      case 'FAILED': return { text: `Payout failed: ${payment.payoutNote ?? 'please retry'}`, tone: 'bad' }
    }
    return null
  }

  if (booking.status === 'CANCELLED' && payment?.status === 'PAID' && role === 'borrower') {
    switch (payment.refundStatus) {
      case 'SUCCESS': return { text: `${kes(amount)} refunded`, tone: 'ok' }
      case 'PENDING': return { text: `Refund of ${kes(amount)} is in progress`, tone: 'wait' }
      case 'FAILED': return { text: `Refund failed: ${payment.refundNote ?? 'contact support'}`, tone: 'bad' }
    }
  }
  return null
}
