import { prisma } from "@/lib/prisma"
import bcrypt, { compare  } from "bcryptjs"
import { sign } from "jsonwebtoken"

export async function POST(request: Request) {

  const body = await request.json()
  const { email, password } = body;
  //fetch user from db by email
  const user = await prisma.user.findUnique({
    where: { email }
  })
  //email does not exist
  if(!user) {
    return Response.json(
      { message: 'Invalid credentials'},
      { status: 401 }
    )
  }
  //comapare password from client, stored password
  const isMatch =  await bcrypt.compare(password, user.password)

  if(!isMatch) {
    return Response.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    )
  } 

  const token = sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d'}
  )

  const response = Response.json(
    { message: 'Login successful'},
    { status: 200 }
  )

  response.headers.set(
    'Set-Cookie' , `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`
  )

  return response
}