import { clearedSessionCookie } from "@/lib/auth"

export async function POST() {
  const response = Response.json({ message: 'Logout successful' }, { status: 200 })
  response.headers.set('Set-Cookie', clearedSessionCookie())
  return response
}