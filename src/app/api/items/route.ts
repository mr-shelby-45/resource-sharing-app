import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { addNewItem } from '@/services/itemServices'

export async function POST(request: Request) {
  try {
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
    const body = await request.json()
    const { title, description } = body;
    //calls addNewItem to add new users
    const newItem = await addNewItem(currentUser, title, description)
    return Response.json(newItem, { status: 201 })
  } catch(error: any) {
    console.error("Add Item error:", error)
    return Response.json(
      { message: error.message || "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
//GET all items 
export async function GET() {
  const items = await prisma.item.findMany()
  return Response.json(items)
}