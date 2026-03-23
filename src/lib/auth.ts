//this is the authorization infrastructure that will be swapped out for middleware 
//this will run first before the api routes, extract identity from the header(that's from the browser)
//evaluate that identity if it exists, either return an authenticated user or an error message
import { verify, sign } from "jsonwebtoken"
import { Role } from "@/generated/prisma/enums"

export function signToken(userId: number, role: Role): string {
  return sign(
    { userId, role }, 
    process.env.JWT_SECRET!, 
    { expiresIn: '7d' }
  )
}

type AuthSuccess = {
  userId: number
}
//this is the contract that the error code should follow
type AuthFailure = {
  error: string
  status: number
}
export function requireAuth(
  request: Request
): AuthSuccess | AuthFailure {
  const cookieHeader = request.headers.get('cookie')

  const token = cookieHeader
    ?.split(';')
    .find(c => c.trim().startsWith('token'))
    ?.split('=')[1]

  if(!token) {
    return { error: 'Unauthorized', status: 401 }
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: number } 
    return { userId: decoded.userId }
  } catch {
    return { error: 'Unauthorized ', status: 401 }
  }

}


