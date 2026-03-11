"use client"
import { useActionState } from "react";

type Props = {
  action: (prevState: any, formData: FormData) => Promise<{ error: string } | void>
}

export default function LoginForm({ action}: Props) {
  const [state, formAction] =useActionState(action, null)

  return (
    <form action={formAction}>
      <input name="email" type="email"placeholder="Email" />
      <input name="password" type="password"placeholder="Password" />
      {state?.error && <p style={{ color: 'red' }}>{state.error}</p>}
      <button type="submit">Login</button>
    </form>
  )
}
