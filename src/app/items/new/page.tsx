//app/items/new/page.tsx
import { redirect } from 'next/navigation'
import ItemForm from './ItemForm'
import { cookies } from 'next/headers'
import { canAddItem } from '@/lib/permissions'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

 async function addItem(prevState: any, formData: FormData) {
  'use server'
  //get title and description from the form UI
  const newTitle = formData.get('title') as string
  const newDescription = formData.get('description') as string
  //cookies have to be forwarded manually
  const cookiesStore = await cookies()
  const token = cookiesStore.get('token')?.value
  if(!token) redirect('/')
  //get the userId and role from the token
  const decoded = verify(token, process.env.JWT_SECRET!) as { userId: number, role: string }
  //get the user from the database by the userId
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  })
  //check for null
  if(!user) {
    redirect('/')
  }
  //check the permissions of the user(role)
  const permission = canAddItem(user)
  if(!permission.allowed) {
    return { error: permission.message ?? 'Permission denied' }
  }
  //check for duplicate items under the same user
  const currentItem = await prisma.item.findFirst({
    where: {
      ownerId: decoded.userId,
      title: newTitle,
      description: newDescription
    }
  })
  if(currentItem) {
    return { error: 'You have added a similar item!' }
  }
  //create the new item
  const newItem = await prisma.item.create({
    data: {
      ownerId: decoded.userId,
      title: newTitle,
      description: newDescription
    }
  })
  redirect('/')
} 
export default function addItemPage() {
  return (
    <div className="page">
      <ItemForm action={addItem} />
    </div>
  )
}