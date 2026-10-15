// src/app/api/auth/register/route.ts
import { registerUser } from "@/services/authServices"
import { signToken, sessionCookie } from "@/lib/auth"
import { validateRegisterInput } from "@/lib/validators"
import { handleError, readJson } from "@/lib/apiHandler"

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } =
      await readJson<{ name: string; email: string; phone: string; password: string }>(request)
    validateRegisterInput(name, email, phone, password)
    const user = await registerUser(name, email, phone, password)
    const response = Response.json({ message: 'Registration successful!' }, { status: 201 })
    response.headers.set('Set-Cookie', sessionCookie(signToken(user.id)))
    return response
  } catch (error) {
    return handleError(error, "Register error")
  }
}