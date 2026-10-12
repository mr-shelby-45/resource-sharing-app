//bookingServices.ts
import { prisma } from "@/lib/prisma";
import { canApproveBooking, canCreateBooking, canCancelBooking, canReturnItem } from "@/lib/permissions";
import { validateBookingDates } from "@/lib/validators";
import { todayInNairobi } from "@/lib/dates";
import { Item, User } from "@/generated/prisma/client";

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

  if(action === 'approve') {
    if(booking.endDate < todayInNairobi()) throw new Error("This request has expired")
    //friendly check first in the database
    const clash = await prisma.booking.findFirst({
      where: {
        itemId: item.id,
        status: "APPROVED",
        NOT: {id: bookingId },
        startDate: { lte: booking.endDate },
        endDate: { gte: booking.startDate}
      }
    })
    if(clash) throw new Error("These dates overlap a booking you alreay approved")
    //only pending request that share a date for the same item are rejected/cancelled
    const [ updatedBooking ] = await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'APPROVED'}
      }),
      prisma.booking.updateMany({
        where: {
          itemId: item.id,
          NOT: {
            id: bookingId
          },
          status: 'PENDING'
        },
        data: { status: "REJECTED"}
      })
    ])
    return updatedBooking
  }
  if(action === 'reject') {
    const rejectedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'REJECTED' }
    })
    return rejectedBooking
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

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "RETURNED", returnedAt: new Date() }
  })
}

export async function cancelBooking(user: User, bookingId: number) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  })
  if(!booking) throw new Error("Booking not found")
  //check permission to cancel and the booking status(status === 'PENDING') with canCancelBooking function from permissions.ts
  const permission = canCancelBooking(user, booking)
  if(!permission.allowed) throw new Error(permission.message)

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED"}
  })
}