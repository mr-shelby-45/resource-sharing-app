//user permissions will be filtered through here before the api routes
import { User, Item, Booking } from '@/generated/prisma/client'

//note: inorder not to bring about return bugs, then you have to deny the invalid cases first, start with the specific checks first then move on to broad checks
//admin check in this case comes first, returns true then all the other conditions are skipped, therefore they have all the permissions
export function canAddItem(user: User) {
  if(user.isAdmin) {
    return { allowed: true }
  }
  if(!user.canList) {
    return { allowed: false, message: 'Only Owners can add new items'}
  }
  return { allowed: true }
}

export function canCreateBooking(user: User, item: Item, isAvailable: boolean) {
  if(!isAvailable) {                                                     
    return{ allowed: false, message: 'item is not available for booking'}
  }    
  if(item.ownerId === user.id) {                                                                                                  
    return{ allowed: false, message: "can't book your own item"}                                                              
  }
  if(user.isAdmin) {
    return { allowed: true }
  }
  if(!user.canBorrow) {
    return { allowed: false, message: "Cannot borrow, check with admin"}
  }
  return{ allowed: true }
}

export function canApproveBooking( user: User, item: Item, booking: Booking) {
  //role check in this case is owner.
  if(user.isAdmin) {
    return{ allowed: true }
  }
  if(!user.canList) {
  return { allowed: false, message: 'Only owners can approve this booking' }
  }
  //user can only approve the item that they own
  if(item.ownerId !== user.id) {
    return{ allowed: false, message: 'one can only approve the items that they own'}
  }
  //booking must be pending -> checks if the booking has been cancelled.
  if(booking.status !== 'PENDING') {
    return { allowed: false, message: 'This booking has already been processed!'}
  }
  return { allowed: true }
}
//move from specific checks to broader checks

export function canDeleteItem(user: User, item: Item, isAvailable: boolean) {
  // only owner and admin can delete an item.
  if(user.isAdmin) {
    return{ allowed: true }
  }
  if(!user.canList) {
  return { allowed: false, message: 'Only Owners can delete this item'}
  }
  //makes sure that you can only delete an item that you own and not any other even if your user.role === 'owner'
  if(item.ownerId !== user.id) {
    return { allowed: false, message: 'you can only delete your own item'}
  }
  if(!isAvailable) {
    return{ allowed: false, message: 'Cannot delete a booked item'}
  }
  return { allowed: true }
}

export function canCancelBooking(user: User, booking: Booking) {
  if(user.isAdmin) {
    return { allowed: true }
  }
  if(booking.borrowerId !== user.id) {
    return { allowed: false, message: "You can only cancel your own bookings"}
  }
  if(booking.status !== "PENDING") {
    return { allowed: false, message: "Only pending bookings can be cancelled" }
  }
  return { allowed: true }
}

export function canReturnItem(user: User, booking: Booking, item: Item) {
  if(user.isAdmin) {
    return { allowed: true }
  }
  if(item.ownerId !== user.id) {
    return { allowed: false, message: "Only the item owner can mark it as returned"
    }
  }
  if(booking.status !== "APPROVED") {
    return { allowed: false, message: "Only approved items can be returned"}
  }
  return { allowed: true }
}