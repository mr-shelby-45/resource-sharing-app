'use client'
import { useActionState, useState } from 'react'
import Link from 'next/link'
import PasswordInput from '../components/PasswordInput'
import type { FormState } from '@/lib/formState'

type Props = {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
}

export default function RegistrationForm({ action }: Props) {
  const [state, formAction] = useActionState(action, null)
  const [mismatch, setMismatch] = useState(false)

  // Runs on every keystroke. Marks the confirm box invalid while it differs from the password,
  // which makes the browser block the submit and keeps everything typed.
  function checkMatch(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const confirm = form.elements.namedItem('confirmPassword') as HTMLInputElement
    const differs = confirm.value !== '' && confirm.value !== password
    confirm.setCustomValidity(differs ? 'Passwords do not match' : '')
    setMismatch(differs)
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h1>Welcome to Jirani</h1>

        <form action={formAction} onInput={checkMatch} className="form">
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" type="text" autoComplete="name" placeholder="Name"
              defaultValue={state?.values?.name} required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" placeholder="Email"
              defaultValue={state?.values?.email} required />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="0712345678"
              defaultValue={state?.values?.phone} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <PasswordInput name="password" placeholder="At least 8 characters" autoComplete="new-password" minLength={8} />
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <PasswordInput name="confirmPassword" placeholder="Type it again" autoComplete="new-password" />
            {mismatch && <p className="field-hint" role="alert">Passwords do not match</p>}
          </div>

          {state?.error && <p className="form-error" role="alert">{state.error}</p>}

          <button type="submit" className="btn-primary btn-lg">Register</button>
        </form>

        <p className="auth-switch muted">
          Already have an account? <Link href="/login" className="strong">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
