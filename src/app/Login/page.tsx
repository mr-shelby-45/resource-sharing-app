// page.tsx - server component
import { redirect } from "next/navigation"
import { cookies } from 'next/headers'
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import LoginForm from "./Loginform"
import { sign } from "jsonwebtoken"
async function login(prevState: any,formData: FormData) {
  'use server'
  //.get takes in the data entered
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  //retrieve user by their email
  const user = await prisma.user.findUnique({
    where: { email }
  }) 
  if(!user) {
    return { error: 'Invalid credentials' }
  }
  //compare entered password and the stored password
  const isMatch = await bcrypt.compare(password, user.password)
  if(!isMatch) {
    return { error: 'Invalid credentials' }
  }
  const token = sign(
    {userId: user.id, role: user.role},
    process.env.JWT_SECRET!,
    {expiresIn: '7d'}
  )
  const cookiesStore = await cookies()
  cookiesStore.set('token', token, {
    httpOnly: true,
    path: '/',
    maxAge: 604800,
    sameSite: 'strict'
  })
  redirect('/')

}
//Server Actions in Next.js have a specific contract: they either return nothing or return serializable data, but they cannot return Response objects.
//exports to the client component
export default function loginPage() {
  return (
    <div>
      <h1>Login</h1>
      <LoginForm action={login}/>
    </div>
  )
}