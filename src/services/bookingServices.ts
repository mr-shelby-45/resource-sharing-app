//bookingServices.ts
import { prisma } from "@/lib/prisma";
import { canApproveBooking, canCreateBooking, canCancelBooking, canReturnItem } from "@/lib/permissions";
import { validateBookingDates } from "@/lib/validators";
import { todayInNairobi } from "@/lib/dates";
import { Item, User } from "@/generated/prisma/client";
import { AppError, isOverlapViolation } from "@/lib/errors"
import { BookingStatus } from "@/generated/prisma/client"

// Moves a booking from one status to another ONLY if it is still in the expected status.
// If someone else changed it first, count is 0 and we stop instead of overwriting their change.
async function moveStatus(
  bookingId: number,
  from: BookingStatus,
  to: BookingStatus,
  extra: { returnedAt?: Date } = {}
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
  if(!permission.allowed) throw new Error(permission.message);
  
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
  if(!booking) throw new Error('Booking not found')
  //find the associated item
  const item = await prisma.item.findUnique({
    where: { id: booking.itemId }
  })
  if(!item) throw new Error('Associated item not found!')
  
  //check permission to approve a booking
  const permission = canApproveBooking(user, item, booking)
  if(!permission.allowed) throw new Error(permission.message)

  if (action === "approve") {
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
        // 1. approve, but only if it is still PENDING (guards against double-click / cancel race)
        const approved = await tx.booking.updateMany({
          where: { id: bookingId, status: "PENDING" },
          data: { status: "APPROVED" },
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
          data: { status: "REJECTED" },
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
  if(!booking) throw new Error("Booking not found")

  const item = await prisma.item.findUnique({
    where: {
      id: booking.itemId
    }
  })
  if(!item) throw new Error("Associated item not found!")
  
  const permission = canReturnItem(user, booking, item)
  if(!permission.allowed) throw new Error(permission.message)
  
  return moveStatus(bookingId, "APPROVED", "RETURNED", { returnedAt: new Date() })
}

export async function cancelBooking(user: User, bookingId: number) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  })
  if(!booking) throw new Error("Booking not found")
  //check permission to cancel and the booking status(status === 'PENDING') with canCancelBooking function from permissions.ts
  const permission = canCancelBooking(user, booking)
  if(!permission.allowed) throw new Error(permission.message)
  return moveStatus(bookingId, "PENDING", "CANCELLED")
}