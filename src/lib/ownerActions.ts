import { prisma } from '@/lib/prisma'
import { ownerActionWhere } from '@/lib/bookingTasks'

// how many bookings on this owner's items are waiting for them (shown on the navbar and Requests page)
export function countOwnerActions(ownerId: number) {
  return prisma.booking.count({ where: ownerActionWhere(ownerId) })
}
