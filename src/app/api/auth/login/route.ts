import { loginUser } from "@/services/authServices"
import { signToken } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    //destructure email and password from the body
    const { email, password } = body;
    //authServices logins the user
    const user = await loginUser(email, password)
    //signs the cookie
    const signedToken = signToken(user.id, user.role)
    const response = Response.json(
      { message: 'Login successful'},
      { status: 200 }
    )
    response.headers.set(
      'Set-Cookie' , `token=${signedToken}; HttpOnly; Path/=; 
    Max-Age=604800; SameSite=Strict`
    )
    return response
  } catch(error : any) {
    console.log("Auth error :",  error.message )

    const status = error.message === "Invalid credentials" ? 404 : 500
    return Response.json(
      {message: error.message || 'Internal server error'},
      { status }
    )
  }
}