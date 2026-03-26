//file path -> src/app/items/[id]/DeleteButton.tsx
'use server'

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verify } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { deleteItem } from "@/services/itemServices";

export async function handleDelete(itemId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if(!token) redirect ('/login')

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: number }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
    if(!user) return { error: "User not found"}

    await deleteItem(itemId, user)
  } catch(error: any) {
    console.error("Deletion error:", error)
    return { error: "Failed to delete item. " + error.message }
  }
  redirect('/')
}