'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import PasswordInput from '../components/PasswordInput'
import type { FormState } from '@/lib/formState'

type Props = {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
}

export default function LoginForm({ action }: Props) {
  const [state, formAction] = useActionState(action, null)

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h1>Welcome back</h1>
        <p className="muted auth-intro">Sign in to your Jirani account</p>

        <form action={formAction} className="form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com"
              defaultValue={state?.values?.email} required />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <PasswordInput name="password" placeholder="Your password" autoComplete="current-password" />
          </div>

          {state?.error && <p className="form-error" role="alert">{state.error}</p>}

          <button type="submit" className="btn-primary btn-lg">Sign in</button>
        </form>

        <p className="auth-switch muted">
          Don&apos;t have an account? <Link href="/register" className="strong">Register</Link>
        </p>
      </div>
    </div>
  )
}
