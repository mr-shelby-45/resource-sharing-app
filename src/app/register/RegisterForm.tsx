'use client'
import { useActionState } from "react"

type Props = {
  action: (prevState: any, formData: FormData) => Promise<{ error: string } | void> 
}
export default function RegistrationForm( { action } : Props) {
  const [state, formAction] = useActionState(action, null)

  return (
    <form action={formAction}>
      <input name="name" type="name" placeholder="Name"/>
      <input name="email" type="email" placeholder="Email"/>
      <input name="phone" type="text" placeholder="Phone"/>
      <input name="password" type="password" placeholder="Password"/>

      <select name="role">
        <option value={'OWNER'}>Owner</option>
        <option value={'BORROWER'}>Borrower</option>  
      </select>

      {state?.error && <p style={{color: "red" }}>{state.error}</p>}
      <button type="submit">Register</button>
    </form>
  )
}