'use client'
import { useActionState } from 'react'

type Props = {
  action: (prevState: any, formData: FormData) => Promise<{ error: string } | void>
}

export default function LoginForm({ action }: Props) {
  const [state, formAction] = useActionState(action, null)

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        <h1 style={{ marginBottom: '8px' }}>Welcome back</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem' }}>
          Sign in to your Jirani account
        </p>

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
              Email
            </label>
            <input name="email" type="email" placeholder="you@example.com" />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
              Password
            </label>
            <input name="password" type="password" placeholder="Your password" />
          </div>

          {state?.error && (
            <p style={{ color: '#c0392b', fontSize: '0.9rem', padding: '10px 14px', background: '#fdecea', borderRadius: '8px' }}>
              {state.error}
            </p>
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: '8px', padding: '14px', fontSize: '1rem' }}>
            Sign in
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account? <a href="/register" style={{ color: 'var(--primary)', fontWeight: '500' }}>Register</a>
        </p>
      </div>
    </div>
  )
}