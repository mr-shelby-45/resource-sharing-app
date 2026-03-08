import { prisma } from "@/lib/prisma"
import { sign } from "jsonwebtoken"
import { hash } from "bcryptjs"

export async function POST(request: Request) {
  const body = await request.json()
  //destructure
  const { name, phone, email, role, password } = body;
  //check if user already exist in the db
  const user = await prisma.user.findUnique({
    where: { email }
  })
  if(user) {
    return Response.json(
      { message: "Account exist, Log in instead "}
    )
  }

  const userPassword = await hash(`${password}`, 10)

  const newUser = await prisma.user.create({
    data: {
    name,
    phone,
    email,
    password: userPassword,
    role
    }
  })

  const token = sign(
    { userId: newUser.id, role: newUser.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d'}
  )
  const response = Response.json(
    { message: 'login suceessful'},
    { status: 201 }
  )
  response.headers.set(
    'Set-Cookie', `token=${token}; HttpOnly; Path=/;
    Max-Age=604800; SameSite=Strict`
  )
  return response
}