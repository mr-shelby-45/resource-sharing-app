//app/items/new/page.tsx
import { redirect } from 'next/navigation'
import ItemForm from './ItemForm'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { addNewItem } from '@/services/itemServices'

 async function addItem(prevState: any, formData: FormData) {
  'use server'
  //cookies have to be forwarded manually
  const cookiesStore = await cookies()
  const token = cookiesStore.get('token')?.value
  if(!token) redirect('/')
  try {
    //get title and description from the form UI
    const newTitle = formData.get('title') as string
    const newDescription = formData.get('description') as string
    //get the userId and role from the token
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: number, role: string }
    //get the user from the database by the userId
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
    //check for null
    if(!user) {
      return { error: "User does not exist!"}
    }
    await addNewItem(user, newTitle, newDescription)

  } catch(error: any) {
    return { error: error.message || "Failed to add item"}
  }
  redirect('/items')
} 
export default function addItemPage() {
  return (
    <div className="page">
      <ItemForm action={addItem} />
    </div>
  )
}