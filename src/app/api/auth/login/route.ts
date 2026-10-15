// src/app/api/auth/login/route.ts
import { loginUser } from "@/services/authServices"
import { signToken, sessionCookie } from "@/lib/auth"
import { validateLoginInput } from "@/lib/validators"
import { handleError, readJson } from "@/lib/apiHandler"

export async function POST(request: Request) {
  try {
    const { email, password } = await readJson<{ email: string; password: string }>(request)
    validateLoginInput(email, password)
    const user = await loginUser(email, password)
    const response = Response.json({ message: 'Login successful' }, { status: 200 })
    response.headers.set('Set-Cookie', sessionCookie(signToken(user.id)))
    return response
  } catch (error) {
    return handleError(error, "Login error")
  }
}