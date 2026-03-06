import { prisma } from '@/lib/prisma'

//GET all items 
export async function GET() {
  const items = await prisma.item.findMany()
  return Response.json(items)
}