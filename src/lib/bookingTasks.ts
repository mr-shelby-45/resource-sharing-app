import { todayInNairobi } from '@/lib/dates'

// A booking needs the owner's attention when:
//  - it is PENDING (approve or reject), or
//  - it is APPROVED and its end date has passed without being marked returned.
// Nothing is stored for this. It is worked out from the booking each time it is needed.

export function isOverdue(booking: { status: string; endDate: Date }, today: Date = todayInNairobi()) {
  return booking.status === 'APPROVED' && booking.endDate.getTime() < today.getTime()
}

// the Prisma filter for "bookings on this owner's items that need an answer"
export function ownerActionWhere(ownerId: number, today: Date = todayInNairobi()) {
  return {
    item: { ownerId },
    OR: [
      { status: 'PENDING' as const },
      { status: 'APPROVED' as const, endDate: { lt: today } },
    ],
  }
}
