//get item by id and delete it.
import { canDeleteItem } from "@/lib/permissions"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export async function DELETE(request: Request, { params } : { params: Promise<{id : string }>}) {
  const auth = requireAuth(request)
  //get the userId from the cookie
  if('error' in auth) {
    return Response.json(
      { message: auth.error },
      { status: auth.status}
    )
  }
  //get the user from db by filtering with userId from cookie
  const currentUser = await prisma.user.findUnique({
    where: { id: auth.userId }
  })
  if(!currentUser) {
    return Response.json(
      {message: "user not found"},
      { status: 404 }
    )
  }
  //get the id of the item to be deleted from the URL
  const { id } = await params
  const itemId = Number(id)
  //get the item from the db filter by the id from the URL
  const item = await prisma.item.findUnique({
    where: { id: itemId }
  })
  if(!item) {
    return Response.json(
      { message: "item not found "},
      { status: 404 }
    )
  }
  //Check if there is an approved booking for item the owner wants to delete
  const hasApprovedBooking = await prisma.booking.findFirst({
    where: { id: itemId, status: 'APPROVED' }
  })
  const isAvailable = !hasApprovedBooking
  const permission = canDeleteItem(currentUser, item, isAvailable)

  if(!permission.allowed) {
    return Response.json(
      { message: permission.message },
      { status: 401 }
    )
  }
  //filter the item to delete by item.id and the ownerid 
  const deletedItem = await prisma.item.delete({
    where: {
      id: item.id,
      ownerId: currentUser.id
    }
  })
  //returns the deletedItem with status 200 ,success
  return Response.json(deletedItem, {status: 200})
}
