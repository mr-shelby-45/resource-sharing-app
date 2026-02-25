//find booking by id,change status to approved,set item.available to FALSE, Reject other bookings for the same item.-> owner

import { bookings, items } from '../../data'
import { canApproveBooking } from '@/lib/permissions'
import { requireAuth } from '@/lib/auth'
/*
type Props = {
  params: { id: string }
}*/

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } } // or : Props
) {
  const auth = requireAuth(request)
  if('error' in auth) {
    return Response.json (
      { message: auth.error},
      { status: auth.status} 
    )
  }

  const currentUser = auth.user
  
  const bookingId = Number(params.id)
  const booking = bookings.find(b => b.id === bookingId)
  //check if the booking is available for approval
  if(!booking) {
    return Response.json(
      { message: 'Booking not found' },
      { status: 404 }
    )
  }
  //find the item related to that booking
  const item = items.find(i => i.id === booking.itemId)

  if(!item) {
    return Response.json (
      { message: 'associated item has not been found' },
      { status: 404 }
    )
  }
  const permission = canApproveBooking(currentUser, item, booking)

  if(!permission.allowed) {
    return Response.json (
      { message: permission.message },
      { status: 403}
    )
  }
  //change the status to approved, consequently its becomes unavailable.
  booking.status = 'approved'
  item.available = false

  return Response.json(booking, {status: 200})//sucess

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