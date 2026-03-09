//user permissions will be filtered through here before the api routes
import { User, Item, Booking } from '@/generated/prisma/client'

//note: inorder not to bring about return bugs, then you have to deny the invalid cases first, start with the specific checks first then move on to broad checks
//admin check in this case comes first, returns true then all the other conditions are skipped, therefore they have all the permissions
export function canAddItem(user: User) {
  if(user.role === 'ADMIN') {
    return { allowed: true }
  }
  if(user.role !== 'OWNER') {
    return { allowed: false, message: 'Only Owners can create add new items'}
  }
  return { allowed: true }
 
}

export function canCreateBooking(user: User, item: Item, isAvailable: boolean) {
  //only role check is borrower
  //1. admin overrule
  if(user.role === 'ADMIN') {
    return { allowed: true }
  }

  //2. role check, the invalid role is the owner can't book his own item therefore denied first returning false,hence the code below it will run
  if(user.role !== 'BORROWER') {
    return { allowed: false, message: 'Only borrowers can make bookings'}
  }
  //3. business rule
  if( item.ownerId === user.id) {
    return{ allowed: false, message: " can't book your own item "}
  }

  if(!isAvailable) {
    return{ allowed: false, message: 'item is not available for booking'}
  }
  
  //4. success
  return{ allowed: true }
}
//this is not an if else condition statements
export function canApproveBooking( user: User, item: Item, booking: Booking) {
  //role check in this case is owner.
  if(user.role === 'ADMIN') {
    return{ allowed: true }
  }
  //borrower will return false, stopping the code and denying access, once a return is made code stops
  //owner will entirely skip the block and continue the checks below -> nothing is returned
  if(user.role !== 'OWNER') {
    return{ allowed: false, message: 'only owners can approve booking'}
  }
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
  if(user.role === 'ADMIN') {
    return{ allowed: true }
  }
  
  if(user.role !== 'OWNER') {
    return{ allowed: false, message: 'only owners can delete  items'}
  }
  //makes sure that you can only delete an item that you own and not any other even if your user.role === 'owner'
  if(item.ownerId !== user.id) {
    return { allowed: false, message: 'you can only delete your own item'}
  }

  if(!isAvailable) {
    return{ allowed: false, message: 'item is not available'}
  }

  return { allowed: true }
   /*
 if( user.role === 'owner' && item.ownerId !== user.id) { //
specific check
   return { allowed: false, message: 'can only delete if 
you are an owner and its your item'}
 }
 
 if( user.role === 'owner') { //broad check
   return{ allowed: true, message: 'can delete item'}
 }
 */
 

 //deny invalid case in this case borrower, returns false
}