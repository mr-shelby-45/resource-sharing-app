// Pure payment rules: no database, no network. Everything here is covered by Jest.
import { createHmac, timingSafeEqual } from 'node:crypto'
import { calculateFee } from '@/lib/dates'

// how long a borrower has to pay after the owner approves
export const PAYMENT_WINDOW_HOURS = 24

// the amount the borrower owes, in whole shillings (0 means a free item: no payment step)
export function amountDue(booking: { dailyRate: number; startDate: Date; endDate: Date }): number {
  return calculateFee(booking.dailyRate, booking.startDate, booking.endDate)
}

export function paymentDeadline(approvedAt: Date): Date {
  return new Date(approvedAt.getTime() + PAYMENT_WINDOW_HOURS * 60 * 60 * 1000)
}

export type PayState =
  | 'FREE'            // nothing to pay
  | 'AWAITING'        // approved, borrower still has to pay
  | 'EXPIRED'         // approved but the payment window has passed
  | 'PAID'

// where a booking is in the payment flow; only meaningful for APPROVED bookings
export function payState(
  booking: { status: string; dailyRate: number; startDate: Date; endDate: Date; approvedAt: Date | null },
  payment: { status: string } | null,
  now: Date = new Date()
): PayState {
  if (amountDue(booking) === 0) return 'FREE'
  if (payment?.status === 'PAID') return 'PAID'
  if (booking.approvedAt && now > paymentDeadline(booking.approvedAt)) return 'EXPIRED'
  return 'AWAITING'
}

// Paystack works in the smallest unit: KES 500 is 50000
export const toSubunit = (kes: number) => kes * 100
export const fromSubunit = (subunit: number) => Math.round(subunit / 100)

// 0712345678, +254712345678, 254 712 345 678 and 0112345678 all become 254XXXXXXXXX
export function normaliseKenyanPhone(input: string): string | null {
  const digits = input.replace(/[\s\-()]/g, '').replace(/^\+/, '')
  const m = digits.match(/^(?:254|0)([17]\d{8})$/)
  return m ? `254${m[1]}` : null
}

// Paystack signs the raw webhook body with HMAC SHA-512 using the secret key
export function isValidWebhookSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false
  const expected = createHmac('sha512', secret).update(rawBody).digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(signature)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function newReference(prefix: 'PAY' | 'OUT' | 'REF', bookingId: number): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `JIR-${prefix}-${bookingId}-${Date.now().toString(36).toUpperCase()}${random}`
}

// who may start a payment for a booking
export function canPayBooking(
  user: { id: number },
  booking: { borrowerId: number; status: string; endDate: Date },
  state: PayState,
  today: Date
) {
  if (booking.borrowerId !== user.id) return { allowed: false, message: 'Only the borrower can pay for this booking' }
  if (booking.status !== 'APPROVED') return { allowed: false, message: 'This booking is not waiting for payment' }
  if (state === 'FREE') return { allowed: false, message: 'This booking is free, there is nothing to pay' }
  if (state === 'PAID') return { allowed: false, message: 'This booking is already paid' }
  if (state === 'EXPIRED') return { allowed: false, message: 'The payment time ran out and the booking was cancelled' }
  if (booking.endDate < today) return { allowed: false, message: 'These dates have already passed' }
  return { allowed: true }
}
