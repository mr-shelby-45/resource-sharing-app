//app/items/new/page.tsx
import { redirect } from 'next/navigation'
import ItemForm from './ItemForm'
import { cookies } from 'next/headers'
 async function addItem(prevState: any, formData: FormData) {
  'use server'
  //get title and description from the form UI
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  //cookies have to be forwarded manually
  const cookiesStore = await cookies()
  const token = cookiesStore.get('token')?.value
  //api checks the permission,auth, duplicate items and adds the new item to db
  const res = await fetch('http://localhost:3000/api/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `token=${token}`
    },
    body: JSON.stringify({ title, description})
  })
  if(res.ok) {
    redirect('/')
  } else {
    const data = await res.json()
    return { error: data.message }
  }
}

export default function addItemPage() {
  return(
    <div>
      <h1>Add a new Item</h1>
      <ItemForm action={addItem} />
    </div>
  )
}