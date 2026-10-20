import { describe, expect, it } from '@jest/globals'
import { createHmac } from 'node:crypto'
import {
  PAYMENT_WINDOW_HOURS, amountDue, canPayBooking, fromSubunit, isValidWebhookSignature,
  newReference, normaliseKenyanPhone, paymentDeadline, payState, toSubunit,
} from './payments'
import { paymentNote } from './paymentLabels'

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`)
const booking = (over = {}) => ({
  status: 'APPROVED', dailyRate: 200, startDate: day('2026-11-02'), endDate: day('2026-11-04'),
  approvedAt: new Date('2026-10-30T08:00:00.000Z'), ...over,
})
const NOW = new Date('2026-10-30T09:00:00.000Z')

describe('amounts', () => {
  it('multiplies the daily rate by the inclusive day count', () => {
    expect(amountDue(booking())).toBe(600)
  })
  it('converts to and from Paystack subunits', () => {
    expect(toSubunit(500)).toBe(50000)
    expect(fromSubunit(50000)).toBe(500)
  })
})

describe('payState', () => {
  it('free items need no payment', () => {
    expect(payState(booking({ dailyRate: 0 }), null, NOW)).toBe('FREE')
  })
  it('is awaiting inside the window', () => {
    expect(payState(booking(), null, NOW)).toBe('AWAITING')
  })
  it('expires after the window', () => {
    const late = new Date(paymentDeadline(booking().approvedAt).getTime() + 1000)
    expect(payState(booking(), null, late)).toBe('EXPIRED')
  })
  it('a paid payment stays paid even after the window', () => {
    const late = new Date(NOW.getTime() + (PAYMENT_WINDOW_HOURS + 5) * 3600 * 1000)
    expect(payState(booking(), { status: 'PAID' }, late)).toBe('PAID')
  })
  it('a failed attempt is still awaiting', () => {
    expect(payState(booking(), { status: 'FAILED' }, NOW)).toBe('AWAITING')
  })
})

describe('canPayBooking', () => {
  const today = day('2026-10-30')
  const b = { borrowerId: 1, status: 'APPROVED', endDate: day('2026-11-04') }
  it('lets the borrower pay an awaiting booking', () => {
    expect(canPayBooking({ id: 1 }, b, 'AWAITING', today)).toEqual({ allowed: true })
  })
  it('refuses anyone else', () => {
    expect(canPayBooking({ id: 2 }, b, 'AWAITING', today).allowed).toBe(false)
  })
  it('refuses unapproved, free, paid and expired bookings', () => {
    expect(canPayBooking({ id: 1 }, { ...b, status: 'PENDING' }, 'AWAITING', today).allowed).toBe(false)
    expect(canPayBooking({ id: 1 }, b, 'FREE', today).allowed).toBe(false)
    expect(canPayBooking({ id: 1 }, b, 'PAID', today).allowed).toBe(false)
    expect(canPayBooking({ id: 1 }, b, 'EXPIRED', today).allowed).toBe(false)
  })
  it('refuses when the dates have passed', () => {
    expect(canPayBooking({ id: 1 }, { ...b, endDate: day('2026-10-01') }, 'AWAITING', today).allowed).toBe(false)
  })
})

describe('normaliseKenyanPhone', () => {
  it.each([
    ['0712345678', '254712345678'],
    ['+254712345678', '254712345678'],
    ['254 712 345 678', '254712345678'],
    ['0112345678', '254112345678'],
  ])('accepts %s', (input, expected) => {
    expect(normaliseKenyanPhone(input)).toBe(expected)
  })
  it.each(['12345', '0612345678', '+1 415 555 0100', ''])('rejects %s', input => {
    expect(normaliseKenyanPhone(input)).toBeNull()
  })
})

describe('webhook signature', () => {
  const secret = 'sk_test_secret'
  const body = JSON.stringify({ event: 'charge.success', data: { reference: 'JIR-PAY-1' } })
  const sign = (b: string, s: string) => createHmac('sha512', s).update(b).digest('hex')
  it('accepts the right signature', () => {
    expect(isValidWebhookSignature(body, sign(body, secret), secret)).toBe(true)
  })
  it('rejects a tampered body, a wrong key and a missing header', () => {
    expect(isValidWebhookSignature(body + ' ', sign(body, secret), secret)).toBe(false)
    expect(isValidWebhookSignature(body, sign(body, 'other'), secret)).toBe(false)
    expect(isValidWebhookSignature(body, null, secret)).toBe(false)
    expect(isValidWebhookSignature(body, sign(body, secret), '')).toBe(false)
  })
})

describe('references', () => {
  it('are unique per attempt and carry the booking id', () => {
    const a = newReference('PAY', 7)
    const b = newReference('PAY', 7)
    expect(a).not.toBe(b)
    expect(a).toContain('-PAY-7-')
  })
})

describe('paymentNote', () => {
  const pay = (over = {}) => ({ status: 'PAID', payoutStatus: 'NONE', payoutNote: null, refundStatus: 'NONE', refundNote: null, ...over })
  it('free bookings show nothing', () => {
    expect(paymentNote('borrower', booking({ dailyRate: 0 }), null, NOW)).toBeNull()
  })
  it('tells the borrower to pay, and the owner that they are waiting', () => {
    expect(paymentNote('borrower', booking(), null, NOW)?.text).toMatch(/^Pay KES 600/)
    expect(paymentNote('owner', booking(), null, NOW)?.text).toMatch(/^Waiting for the borrower to pay KES 600/)
  })
  it('shows paid, payout and refund states', () => {
    expect(paymentNote('borrower', booking(), pay(), NOW)?.text).toBe('Paid KES 600')
    const returned = booking({ status: 'RETURNED' })
    expect(paymentNote('owner', returned, pay({ payoutStatus: 'SUCCESS' }), NOW)?.text).toMatch(/paid out to your M-Pesa/)
    expect(paymentNote('owner', returned, pay({ payoutStatus: 'FAILED', payoutNote: 'No balance' }), NOW)).toEqual({ text: 'Payout failed: No balance', tone: 'bad' })
    const cancelled = booking({ status: 'CANCELLED' })
    expect(paymentNote('borrower', cancelled, pay({ refundStatus: 'SUCCESS' }), NOW)?.text).toBe('KES 600 refunded')
    expect(paymentNote('owner', cancelled, pay({ refundStatus: 'SUCCESS' }), NOW)).toBeNull()
  })
})
