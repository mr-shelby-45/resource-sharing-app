import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verify } from "jsonwebtoken"
import Link from 'next/link'
import LogoutButton from "./LogoutButton"


export default async function NavBar() {
  const cookiesStore = await cookies()
  const token = cookiesStore.get('token')?.value

  if(!token) {
    return(
      <nav>
        <Link href={'/login'}>Login</Link>
        <Link href={'/register'}>Register</Link>
      </nav>
    )
  }
  try{
    //get user's id and role from the token
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: number, role: string }
    //get user from database by the userid from the token
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
    //user does not exist redirect to register
    if(!user) {
      return null
    }
    return(
    <nav>
      <Link href={"/"}>Home</Link>
      {user.role === 'OWNER' && <Link href={"/items/new"}>Add item</Link>}
      <LogoutButton />
    </nav>
    )
  } catch {
    return (
      <nav>
        <Link href={'/login'}>Login</Link>
        <Link href={'/register'}>Register</Link>
      </nav>
    )
  }
}