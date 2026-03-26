import { prisma } from "@/lib/prisma"
import { canDeleteItem, canAddItem } from "@/lib/permissions"
import { User } from "@/generated/prisma/client"

export async function addNewItem(user: User, title: string, description: string) {
  const permission = canAddItem(user)
  if(!permission.allowed) throw new Error(permission.message)

  const currentItem = await prisma.item.findFirst({
    where: {
      ownerId: user.id,
      title: title,
      description: description
    }
  })
  if(currentItem) {
    throw new Error('You are adding a similar item!')
  } 
  return await prisma.item.create({
    data: {
      ownerId: user.id,
      title,
      description
    }
  })
}

export async function deleteItem(itemId: number, user: User) {
  //gets the item by id
  const item = await prisma.item.findUnique({
    where: {
      id: itemId
    }
  })
  if(!item) throw new Error('Item not found')
  
  //derive Availability
  const hasApprovedBooking = await prisma.booking.findFirst({
    where: {
      itemId: item.id,
      status: "APPROVED"
    }
  })
  const isAvailable = !hasApprovedBooking
  const permission = canDeleteItem(user, item, isAvailable)
  if(!permission.allowed) throw new Error(permission.message)
  //delete all booking(rejected, pending) for this item only
  return await prisma.$transaction(async (tx) => {
    await tx.booking.deleteMany({
      where: { itemId: itemId }
    })

    return await tx.item.delete({
      where: {
        id: itemId,
        ownerId: user.id
      }
    })
  })
}