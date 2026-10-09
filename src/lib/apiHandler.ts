import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma"
import { User } from "@/generated/prisma/client"

//for errorhandling in routes
export function handleError(error: unknown, context: string) {
  const message = error instanceof Error ? error.message : "An unexpected error occurred"
  console.error(`${context}` , message)
  return Response.json({ message }, { status: 500 }) 
}


//to export a verified user and the request of that user to routes
type AuthedHandler = (request: Request, user: User) => Promise<Response>

export async function withAuth(request: Request, handler: AuthedHandler): Promise<Response> {
  try {
    const auth = requireAuth(request)
    if('error' in auth) return Response.json({ message: auth.error}, { status: auth.status })
    //get the currentUser from the logged in user id
    const currentUser = await prisma.user.findUnique({ where: { id: auth.userId } })
    //check for null
    if(!currentUser) return Response.json({ message: "user not found" }, { status: 404 })
    return await handler(request, currentUser)
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred"
    console.error("API error:", message)
    return Response.json({message}, {status: 500})
  }
}


