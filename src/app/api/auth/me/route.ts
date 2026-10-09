//front-end javascript cannot read the JWT cookie
//Provides info to the ui of whose logged in

import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { handleError } from "@/lib/apiHandler"

export async function GET(request: Request) {
  try {
    const auth = requireAuth(request)
    if('error' in auth) {
      return Response.json(
        { message: auth.error },
        { status: auth.status }
      )
    }
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true
      }
    })
    if(!user) {
      return Response.json(
        { message: 'user not found' },
        { status: 404 }
      )
    }
    return Response.json(user, { status: 200 })
  } catch (error) {
    return handleError(error, "GET me error")
  }
}