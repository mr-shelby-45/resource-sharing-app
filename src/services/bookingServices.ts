//bookingServices.ts
import { prisma } from "@/lib/prisma";
import { canApproveBooking, canCreateBooking, canCancelBooking, canReturnItem } from "@/lib/permissions";
import { validateBookingDates } from "@/lib/validators";
import { todayInNairobi } from "@/lib/dates";
import { Item, User } from "@/generated/prisma/client";
import { AppError, isOverlapViolation, assertAllowed } from "@/lib/errors"
import { BookingStatus } from "@/generated/prisma/client"
import { payState } from "@/lib/payments"
import { payOwner, refundPayment } from "@/services/paymentServices"

export const OVERLAP_REJECTION_NOTE = "The item was booked by someone else for these dates."

// Moves a booking from one status to another ONLY if it is still in the expected status.
// If someone else changed it first, count is 0 and we stop instead of overwriting their change.
// shown to a borrower whose pending request lost because another one was approved for the same days

async function moveStatus(
  bookingId: number,
  from: BookingStatus,
  to: BookingStatus,
  extra: { returnedAt?: Date; decisionNote?: string } = {}
) {
  const { count } = await prisma.booking.updateMany({
    where: { id: bookingId, status: from },
    data: { status: to, ...extra },
  })
  if (count !== 1) {
    throw new AppError(409, "This booking was just changed by someone else. Refresh and try again.")
  }
  return prisma.booking.findUniqueOrThrow({ where: { id: bookingId } })
}

export async function createBooking(user: User, item: Item, startDate: Date, endDate: Date) {
  if(item.deletedAt) throw new AppError(404, "Item not found")
  //validate the dates first, availability rest on them
  validateBookingDates(startDate, endDate)
  //check if there is an approved booking on the item trying to book
  const clash = await prisma.booking.findFirst({
    where: { 
      itemId: item.id,
      status: "APPROVED",
      startDate: { lte: endDate },
      endDate: { gte: startDate }
    }
  })
  const isAvailable = !clash
  //check if the borrower is eligible to borrow
  const permission = canCreateBooking(user, item, isAvailable)
  assertAllowed(permission)
  
  return await prisma.booking.create({
    data: {
      itemId: item.id,
      borrowerId: user.id,
      status: "PENDING",
      startDate,
      endDate,
      dailyRate: item.dailyRate
    }
  })
}

export async function approveBooking(user: User, bookingId: number, action: string) {
  //get the booking by id 
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId}
  })
  if(!booking) throw new AppError(404, 'Booking not found')
  //find the associated item
  const item = await prisma.item.findUnique({
    where: { id: booking.itemId }
  })
  if(!item) throw new AppError(404, 'Associated item not found!')
  
  //check permission to approve a booking
  const permission = canApproveBooking(user, item, booking)
  assertAllowed(permission)

  if (action === "approve") {
    if (item.deletedAt) throw new AppError(409, "This item has been removed")
    if (booking.endDate < todayInNairobi()) throw new AppError(409, "This request has expired")

    // friendly check first, so the common case gets a clear message
    const clash = await prisma.booking.findFirst({
      where: {
        itemId: item.id,
        status: "APPROVED",
        NOT: { id: bookingId },
        startDate: { lte: booking.endDate },
        endDate: { gte: booking.startDate },
      },
    })
    if (clash) throw new AppError(409, "These dates overlap a booking you already approved")

    try {
      return await prisma.$transaction(async (tx) => {
        //lock this item's row so two approvals for the same item run one after the other
        await tx.$queryRaw`SELECT id  FROM "Item" WHERE id = ${item.id} FOR UPDATE`
        // 1. approve, but only if it is still PENDING (guards against double-click / cancel race)
        const approved = await tx.booking.updateMany({
          where: { id: bookingId, status: "PENDING" },
          data: { status: "APPROVED", approvedAt: new Date() },
        })
        if (approved.count !== 1) {
          throw new AppError(409, "This booking has already been processed")
        }

        // 2. reject ONLY pending requests that share a day with this one
        await tx.booking.updateMany({
          where: {
            itemId: item.id,
            id: { not: bookingId },
            status: "PENDING",
            startDate: { lte: booking.endDate },
            endDate: { gte: booking.startDate },
          },
          data: { status: "REJECTED", decisionNote: OVERLAP_REJECTION_NOTE },
        })

        return tx.booking.findUniqueOrThrow({ where: { id: bookingId } })
      })
    } catch (error) {
      // two owners/tabs raced past the check above; the database constraint caught it
      if (isOverlapViolation(error)) {
        throw new AppError(409, "These dates were just booked by another approval")
      }
      throw error
    }
  }

  if (action === "reject") {
    return moveStatus(bookingId, "PENDING", "REJECTED")
  }
}

export async function returnItem(user: User, bookingId: number) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }})
  if(!booking) throw new AppError(404, "Booking not found")

  const item = await prisma.item.findUnique({
    where: {
      id: booking.itemId
    }
  })
  if(!item) throw new AppError(404, "Associated item not found!")
  
  const permission = canReturnItem(user, booking, item)
  assertAllowed(permission)

  // a paid item is the only kind that gets lent out: the owner is paid when it comes back
  const payment = await prisma.payment.findUnique({ where: { bookingId } })
  if (payState(booking, payment) !== "FREE" && payment?.status !== "PAID") {
    throw new AppError(409, "The borrower has not paid for this booking yet")
  }

  const returned = await moveStatus(bookingId, "APPROVED", "RETURNED", { returnedAt: new Date() })
  // paying the owner must never undo the return; a failed payout is shown on the booking and can be retried
  await payOwner(bookingId).catch(error => console.error("Payout failed", bookingId, error))
  return returned
}

export async function cancelBooking(user: User, bookingId: number) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  })
  if(!booking) throw new AppError(404, "Booking not found")

  const item = await prisma.item.findUnique({
    where: { id: booking.itemId }
  })
  if(!item) throw new AppError(404, "Associated item not found!")

  //who may cancel, and when, is decided in permissions.ts
  const permission = canCancelBooking(user, booking, item)
  assertAllowed(permission)

  //when an approved booking is cancelled, the other side is told who did it
  let decisionNote: string | undefined
  if(booking.status === "APPROVED") {
    if(user.id === item.ownerId) decisionNote = "Cancelled by the item owner."
    else if(user.id === booking.borrowerId) decisionNote = "Cancelled by the borrower."
    else decisionNote = "Cancelled by an administrator."
  }

  //the booking must still be in the status we just checked, otherwise someone changed it first
  //the dates open up again by themselves: only APPROVED bookings block dates
  const cancelled = await moveStatus(bookingId, booking.status, "CANCELLED", { decisionNote })
  // cancelling before the start date gives the borrower the full amount back
  await refundPayment(bookingId).catch(error => console.error("Refund failed", bookingId, error))
  return cancelled
}