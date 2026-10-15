import { prisma } from '@/lib/prisma'
import { addNewItem } from '@/services/itemServices'
import { handleError, withAuth } from '@/lib/apiHandler'
import { readJson } from '@/lib/apiHandler'

export async function POST(request: Request) {
  return withAuth(request, async (req, currentUser) => {
    const { title, description, dailyRate, imageUrls } = await readJson<{title: string; description: string; dailyRate: number; imageUrls?: string[]}>(req)
    const newItem = await addNewItem(currentUser, title, description, dailyRate, imageUrls ?? [])
    return Response.json(newItem, { status: 201 })
  })
}
//GET all items 
export async function GET() {
  try {
    const items = await prisma.item.findMany( {
      where: { deletedAt: null }
    })
    return Response.json(items)
  } catch (error) {
    return handleError(error, "Get items error")
  }
}