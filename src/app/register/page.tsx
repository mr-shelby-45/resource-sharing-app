import { redirect } from "next/navigation"
import { cookies } from 'next/headers'
import { prisma } from "@/lib/prisma"
import { sign } from "jsonwebtoken"
import { hash } from 'bcryptjs'
import RegistrationForm from "./RegisterForm"

async function register(prevState: any, formData: FormData) {
  'use server'
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const password = formData.get('password') as string
  const role = formData.get('role')  as 'OWNER' | 'BORROWER'

  //Check if the user is already registered by the email entered
  const user = await prisma.user.findUnique({
    where: { email }
  })
  //throw an error if the account already exist
  if(user) {
    return { error: 'Account already exist'}
  }
  //hash the password entered
  const hashedPassword = await hash(`${password}`, 10)
  //add the users data to the database
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
      role
    }
  })
  //sign the token with the JWT secret
  const token = sign(
    {userId: newUser.id, role: newUser.role },
    process.env.JWT_SECRET!,
    {expiresIn: '7d'}
  )
  //set the cookie 
  const cookiesStore = await cookies()
  cookiesStore.set('token', token, {
    httpOnly: true,
    path: '/',
    maxAge: 604800,
    sameSite: 'strict'
  })
  //on successful reg redirect to the homepage
  redirect('/')
}
//<!--react elements have to be uppercase -->
export default function registrationPage() {
  return (
    <div>
      <h1>Register</h1>
      <RegistrationForm action={register}/>
    </div>
  )
}