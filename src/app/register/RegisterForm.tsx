'use client'
import { useActionState } from "react"

type Props = {
  action: (prevState: any, formData: FormData) => Promise<{ error: string } | void> 
}
export default function RegistrationForm( { action } : Props) {
  const [state, formAction] = useActionState(action, null)

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "24px"
    }}>
      <div className="card" 
      style={{ 
        width: "100%", 
        maxWidth: '420px'
        }}>
        <h1 style={{ marginBottom: '8px' }}>Welcome to Jirani</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: '32px', fontSize: '0.95rem' }}>
          Register your Jirani account
          </p>
        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem',
            fontWeight: '500' }}>
              Name
            </label>
            <input name="name" type="name" placeholder="Name"/>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem',
            fontWeight: '500' }}>
              Email
            </label>
            <input name="email" type="email" placeholder="Email"/>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem',
              fontWeight: '500' }}>
                Phone
              </label>
            <input name="phone" type="text" placeholder="Phone"/>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem',
            fontWeight: '500' }}>
              Password
            </label>
            <input name="password" type="password" placeholder="Password"/>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem',
            fontWeight: '500' }}>
              Choose a role e.g Owner to add an item for booking, Borrower to borrow an item
            </label>
            <select name="role">
              <option value={'OWNER'}>Owner</option>
              <option value={'BORROWER'}>Borrower</option>  
            </select>
          </div>
          {state?.error && (
              <p style={{ color: '#c0392b', fontSize: '0.9rem', padding: '10px 14px', 
                background: '#fdecea', borderRadius: '8px' }}>
                {state.error}
              </p>
          )}
          <button type="submit" className="btn-primary" style={{ marginTop: '12px', padding: '14px', fontSize: '1rem' }}>
            Register
          </button>
          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Have an account? Sign in instead  <a href="/login" style={{ color: 'var(--primary)', fontWeight: '500' }}
          >Sign in</a>
          </p>
        </form>
      </div>
    </div>
  )
}