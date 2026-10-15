import { prisma } from '@/lib/prisma'
import bcrypt, { hash } from 'bcryptjs'
import { validateLoginInput, validateRegisterInput } from "@/lib/validators"
import { AppError, assertAllowed } from "@/lib/errors"

export async function registerUser(name: string, email: string, phone: string, password: string) {
  //data validation
  validateRegisterInput(name, email, phone, password)
  //check if the user already exist in db using the entered email
  const user = await prisma.user.findUnique({
    where: { email }
  })
  //flag if it exists
  if(user) {
    throw new AppError(409, 'An account already exist!')
  }
  //hash the entered password
  const hashedPassword = await hash(password, 10)
  //create the newUser
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword
    }
  })
  const regUser = {
    id: newUser.id
  }
  return regUser
}

export async function loginUser(email: string, password: string) {
  //validate input
  validateLoginInput(email, password)
  //check for the user in db
  const user = await prisma.user.findUnique({
    where: { email }
  })
  if(!user) {
    throw new AppError(401, 'Invalid credentials')
  }
  //verify the entered password
  const isMatch =  await bcrypt.compare(password, user.password)
  if(!isMatch) {
    throw new AppError(401, 'Invalid credentials')
  }
  const loggedIn = {
    id: user.id
  }
  return loggedIn
}