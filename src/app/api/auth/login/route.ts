import { loginUser } from "@/services/authServices"
import { signToken } from "@/lib/auth"
import { validateLoginInput } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json()
    //destructure email and password from the body
    const { email, password } = body;
    //validate parsed data
    validateLoginInput(email, password)
    //authServices logins the user
    const user = await loginUser(email, password)
    //signs the cookie
    const signedToken = signToken(user.id)
    const response = Response.json(
      { message: 'Login successful'},
      { status: 200 }
    )
    response.headers.set(
      'Set-Cookie' , 
      `token=${signedToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`)
    return response
  } catch(error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    console.log("Auth error :",  message )

    const status = message === "Invalid credentials" ? 401 : 500
    return Response.json(
      {message: message || 'Internal server error'},
      { status }
    )
  }
}