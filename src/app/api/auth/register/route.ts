import { registerUser } from "@/services/authServices"
import { signToken } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    //destructure new User's details from the body
    const { name, email, phone, password } = body;
    const user = await registerUser(name, email, phone, password)
    const signedToken = signToken(user.id)
    //check if user already exist in the db
    const response = Response.json(
      { message: 'Regitration successful!'},
      { status: 200 }
    )
    response.headers.set(
      'Set-Cookie', 
      `token=${signedToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`)
    return response
  } catch(error: any) {
    console.log('Registration error:', error.message)
    const status = error.message === 'An account already exist!' ? 409 : 500
    return Response.json(
      { message: error.message || 'Internal server error'},
      { status }
    )
  }
}