'use client'
import { useActionState } from "react"
//uses server action to get data from the form, details for the new item to be added 
type Props = {
  action: (prevState: any, formData: FormData) => Promise<{ error: string} | void>
}
//exports item's details to page.tsx, server component, checks duplicate and adds item to db
export default function ItemForm({ action }: Props) {
  const [state, formAction] = useActionState(action, null)

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '40px 24px'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
        <h1 style={{ marginBottom: '8px' }}>List an Item</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem' }}>
          Share something with your community
        </p>

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
              Item name
            </label>
            <input name="title" type="text" placeholder="e.g. Electric drill, Ladder, Tent" />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
              Description
            </label>
            <textarea
              name="description"
              placeholder="Condition, any usage notes, pickup instructions..."
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>

          {state?.error && (
            <p style={{ color: '#c0392b', fontSize: '0.9rem', padding: '10px 14px', background: '#fdecea', borderRadius: '8px' }}>
              {state.error}
            </p>
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: '8px', padding: '14px', fontSize: '1rem' }}>
            List Item
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <a href="/" style={{ color: 'var(--primary)', fontWeight: '500' }}>Back to dashboard</a>
        </p>
      </div>
    </div>
  )
}