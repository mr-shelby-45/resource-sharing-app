import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

// Returns the logged-in user from the database, or null if not logged in.
export async function getCurrentUser() {
  const token = (await cookies()).get("token")?.value
  if (!token) return null
  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: number }
    return await prisma.user.findUnique({ where: { id: decoded.userId } })
  } catch {
    return null
  }
}