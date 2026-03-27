import { prisma } from "@/lib/prisma";
import { canApproveBooking, canCreateBooking } from "@/lib/permissions";
import { Item, User } from "@/generated/prisma/client";

export async function createBooking(user: User, item: Item) {
  //check if there is an approved booking on the item trying to book
  const hasApprovedBooking = await prisma.booking.findFirst({
    where: { 
      itemId: item.id,
      status: "APPROVED"
    }
  })
  const isAvailable = !hasApprovedBooking
  //check if the borrower is eligible to borrow
  const permission = canCreateBooking(user, item, isAvailable)
  if(!permission.allowed) throw new Error(permission.message);
  
  const booked = await prisma.booking.create({
    data: {
      itemId: item.id,
      borrowerId: user.id,
      status: "PENDING"
    }
  })
  return(booked)
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
    return(updatedBooking)
  }
  if(action === 'reject') {
    const rejectedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'REJECTED' }
    })
    return (rejectedBooking)
  } 
}