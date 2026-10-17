import { isOverdue } from './bookingTasks'

const day = (s: string) => new Date(`${s}T00:00:00.000Z`)

describe('isOverdue', () => {
  const today = day('2026-10-17')

  test('approved booking that ended yesterday is overdue', () => {
    expect(isOverdue({ status: 'APPROVED', endDate: day('2026-10-16') }, today)).toBe(true)
  })
  test('approved booking ending today is not overdue yet', () => {
    expect(isOverdue({ status: 'APPROVED', endDate: day('2026-10-17') }, today)).toBe(false)
  })
  test('approved booking ending later is not overdue', () => {
    expect(isOverdue({ status: 'APPROVED', endDate: day('2026-10-20') }, today)).toBe(false)
  })
  test('only approved bookings can be overdue', () => {
    for (const status of ['PENDING', 'REJECTED', 'RETURNED', 'CANCELLED']) {
      expect(isOverdue({ status, endDate: day('2026-10-01') }, today)).toBe(false)
    }
  })
})
