import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma"
import { User } from "@/generated/prisma/client"
import { AppError } from "@/lib/errors"


//for errorhandling in routes
export function handleError(error: unknown, context: string) {
  // errors we raised on purpose carry their own status and a message that is safe to show
  if (error instanceof AppError) {
    return Response.json({ message: error.message }, { status: error.status })
  }
  // anything else is a bug or a database failure: log the details, show a generic message
  console.error(context, error)
  return Response.json({ message: "Something went wrong. Please try again." }, { status: 500 })
}

// request.json() throws on an empty or broken body; turn that into a clear 400
export async function readJson<T = Record<string, unknown>>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T
  } catch {
    throw new AppError(400, "Request body must be valid JSON")
  }
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
    return handleError(error, "API error")
  }
}


