import { prisma } from '@/lib/prisma'
import bcrypt, { hash } from 'bcryptjs'

export async function registerUser(name: string, email: string, phone: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  })
  //check if the user already exist in db
  if(user) {
    throw new Error('An account already exist!')
  }
  //hash the entered password
  const hashedPassword = await hash(`${password}`, 10)
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
  return(regUser)
}

export async function loginUser(email: string, password: string) {
  //check for the user in db
  const user = await prisma.user.findUnique({
    where: { email }
  })
  if(!user) {
    throw new Error('Invalid credentials')
  }
  //verify the entered password
  const isMatch =  await bcrypt.compare(password, user.password)
  if(!isMatch) {
    throw new Error('Invalid credentials')
  }
  const loggedIn = {
    id: user.id
  }
  return(loggedIn)
}