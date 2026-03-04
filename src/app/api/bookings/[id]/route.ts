//find booking by id,change status to approved,set item.available to FALSE, Reject other bookings for the same item by owner

import { canApproveBooking } from '@/lib/permissions'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
/*
type Props = {
  params: { id: string }
}*/
//nextjs 15 params are now a promise that you need to await
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // or : Props
) {
  const auth = requireAuth(request)
  if('error' in auth) {
    return Response.json (
      { message: auth.error},
      { status: auth.status} 
    )
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: auth.userId}
  })

  if(!currentUser) {
    return Response.json(
      { message: 'user not found' },
      { status: 404 }
    )
  }


  /*
  finding booking by id from the simulated db by importing bookings from the data.ts
  const booking = bookings.find(b => b.id === bookingId)
  //check if the booking is available for approval
  */
  const { id } = await params
  const bookingId = Number(id)

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  })
  //booking is an object
  if(!booking) {
    return Response.json(
      { message: 'Booking not found' },
      { status: 404 }
    )
  }
  /*
  //find the item related to that booking
  const item = items.find(i => i.id === booking.itemId)
  */
  const item = await prisma.item.findUnique({
    where: { id: booking.itemId }
  })

  if(!item) {
    return Response.json (
      { message: 'associated item has not been found' },
      { status: 404 }
    )
  }
  const permission = canApproveBooking(currentUser, item, booking)//shld be in that order currentUser,item,booking.

  if(!permission.allowed) {
    return Response.json (
      { message: permission.message },
      { status: 403}
    )
  }
  //change the status to approved, consequently its becomes unavailable.

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'APPROVED'}
  })

  
  await prisma.item.update({
    where: { id: item.id},
    data: { available: false }
  })

  return Response.json(updatedBooking, {status: 200})//sucess

  /*
  if(body.action === 'approve') {
    booking.status = 'approved'
    //check if the borrower owns the item they are trying to borrow
    const item = items.find(i => i.id === booking.itemId)
    
    if (item?.ownerId !== currentUser.id) {
      return Response.json({ message: 'Forbidden' },{ status: 403})
    }
    
    
    //other pending bookings for same item

    bookings.forEach(b => {
      if (
        b.itemId === booking.itemId && b.id !== booking.id && b.status === 'pending' 
      ) {
        b.status = 'rejected'
      }
    })
  }
  */
}