import { prisma } from "@/lib/prisma"
import { canDeleteItem, canAddItem } from "@/lib/permissions"
import { validateItemInput, validateImageUrls } from "@/lib/validators"
import { User } from "@/generated/prisma/client"
import { AppError, assertAllowed } from "@/lib/errors"
import { del } from "@vercel/blob"

export async function addNewItem(user: User, title: string, description: string, dailyRate: number, imageUrls: string[] = []) {
  const permission = canAddItem(user)
  assertAllowed(permission)
  //input checks
  validateItemInput(title, description, dailyRate)
  validateImageUrls(imageUrls)
  //check for an already similar item by the same user
  const currentItem = await prisma.item.findFirst({
    where: {
      ownerId: user.id,
      title: title,
      description: description
    }
  })
  if(currentItem) {
    throw new AppError(409, 'You are adding a similar item!')
  } 
  return await prisma.item.create({
    data: {
      ownerId: user.id,
      title,
      description,
      dailyRate,
      images: { create: imageUrls.map((url, position) => ({ url, position }))}
    }
  })
}

export async function deleteItem(itemId: number, user: User) {
  //gets the item by id, with its photos so we can clean them up afterwards
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { images: true }
  })
  if(!item) throw new AppError(404, 'Item not found')

  //pending and approved bookings are live commitments to other people
  const activeBooking = await prisma.booking.findFirst({
    where: { itemId: item.id, status: { in: ["PENDING", "APPROVED"] } }
  })
  //who may delete: role and ownership only (true = "ignore bookings here"), checked first so
  //people who may not delete it learn nothing about its bookings
  assertAllowed(canDeleteItem(user, item, true))
  //live bookings block everyone, admins included, with a clear message
  if(activeBooking) {
    throw new AppError(409, "This item has pending or approved bookings. Reject or cancel them first.")
  }

  //only finished bookings are left (returned, cancelled, rejected); they go with the item
  const deleted = await prisma.$transaction(async (tx) => {
    await tx.booking.deleteMany({ where: { itemId: item.id } })
    //no ownerId filter: the permission check above already decided who may delete
    return tx.item.delete({ where: { id: item.id } })
  })

  //remove the photo files too; a failure here must not undo a delete that already happened
  const urls = item.images.map(image => image.url)
  if(urls.length > 0) {
    try {
      await del(urls)
    } catch (error) {
      console.error("Could not delete photos from Blob:", error)
    }
  }
  return deleted
}