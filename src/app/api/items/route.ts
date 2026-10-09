import { prisma } from '@/lib/prisma'
import { addNewItem } from '@/services/itemServices'
import { handleError, withAuth } from '@/lib/apiHandler'

export async function POST(request: Request) {
  return withAuth(request, async (req, currentUser) => {
    const { title, description } = await req.json()
    const newItem = await addNewItem(currentUser, title,description)
    return Response.json(newItem, { status: 201 })
  })
}
//GET all items 
export async function GET() {
  try {
    const items = await prisma.item.findMany()
    return Response.json(items)
  } catch (error) {
    handleError(error, "Get items error")
  }
}