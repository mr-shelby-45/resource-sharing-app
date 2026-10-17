'use client'
import { useState } from 'react'

type Props = {
  name: string
  placeholder?: string
  autoComplete: 'current-password' | 'new-password'
  minLength?: number
}

// A password field with a Show / Hide button so people can check what they typed.
// The value stays in the input itself, so it works with a normal form action.
export default function PasswordInput({ name, placeholder, autoComplete, minLength }: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="password-field">
      <input
        id={name}
        name={name}
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        required
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible(v => !v)}
        aria-pressed={visible}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}
