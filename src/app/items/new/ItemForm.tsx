//app/items/new/ItemForm
'use client'
import { useActionState } from "react"

type Props = {
  action: (prevState: any, formData: FormData) => Promise<{ error: string} | void>
}

export  default function ItemForm({ action}: Props) {
  const[state, formAction] =useActionState(action, null)

  return (
    <form action={formAction}>
      <input name="title" type="text" placeholder="name of the item"/>
      <input name="description" type="text" placeholder="description of the item"/>
      {state?.error && <p style={{ color: 'red' }}>{state.error}</p>}
      <button type="submit">Add Item</button>
    </form>
  )
}