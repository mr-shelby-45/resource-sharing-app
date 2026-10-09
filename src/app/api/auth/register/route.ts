import { registerUser } from "@/services/authServices"
import { signToken } from "@/lib/auth"
import { validateRegisterInput } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json()
    //destructure new User's details from the body
    const { name, email, phone, password } = body;
    //validate the parsed data
    validateRegisterInput(name, email, phone, password)
    const user = await registerUser(name, email, phone, password)
    const signedToken = signToken(user.id)
    const response = Response.json(
      { message: 'Regitration successful!'},
      { status: 201 }
    )
    response.headers.set(
      'Set-Cookie', 
      `token=${signedToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`)
    return response
  } catch(error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    const status = message === "An account already exist" ? 409 : 500
    return Response.json({ message }, { status })
  }
}