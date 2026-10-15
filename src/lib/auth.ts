//this is the authorization infrastructure that will be swapped out for middleware 
//this will run first before the api routes, extract identity from the header(that's from the browser)
//evaluate that identity if it exists, either return an authenticated user or an error message
import { verify, sign } from "jsonwebtoken"


export function signToken(userId: number): string {
  return sign(
    { userId }, 
    process.env.JWT_SECRET!, 
    { expiresIn: '7d' }
  )
}

//the one place the login cookie is built. Secure means "only over https"; it is skipped
//in development because plain http://localhost would otherwise not keep the cookie
const COOKIE_BASE = `HttpOnly; Path=/; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`

export function sessionCookie(token: string): string {
  return `token=${token}; ${COOKIE_BASE}; Max-Age=604800`
}

export function clearedSessionCookie(): string {
  return `token=; ${COOKIE_BASE}; Max-Age=0`
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
  .map(c => c.trim())
  .find(c => c.startsWith('token='))
  ?.slice('token='.length)
  
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


