import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { canAddItem } from '@/lib/permissions'

export async function POST(request: Request) {
  const auth = requireAuth(request)
  if('error' in auth) {
    return Response.json(
      { message: auth.error },
      { status: auth.status }
    )
  }
  //checks if the auth.userId is the same as the user stored in the database
  const currentUser = await prisma.user.findUnique({
    where: { id: auth.userId }
  })
  if(!currentUser) {
    return Response.json(
      { message: 'User does not exist! '},
      { status: 404 }
    )
  }
  const permission = canAddItem(currentUser)
  if (!permission.allowed) {
    return Response.json(
      { message: permission.message },
      { status: 403 }
    )
  }

  const body = await request.json()

  const { title, description } = body;

  const currentItem = await prisma.item.findFirst({
    where: { 
      ownerId: auth.userId, 
      title: title,
      description: description
    }
  })
  //returns currentItem as null if there isn't a similar item
  if(currentItem) {
    //duplicate found - rejects it
    return Response.json(
      { message: "you have added a similar item"},
      { status: 409 }
    )
  }

  const newItem = await prisma.item.create({
    data: {
      ownerId: auth.userId,
      title,
      description
    }
  })
  return Response.json(newItem, { status: 201 })

}
//GET all items 
export async function GET() {
  const items = await prisma.item.findMany()
  return Response.json(items)
}