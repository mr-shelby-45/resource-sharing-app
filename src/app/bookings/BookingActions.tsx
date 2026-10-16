//client component that the owner accepts or rejects a booking.
//booking is split into a server and client 
//bookingActions - client buttons, eventhandler
//pages -> fetches the bookings, conditional rendering.

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Action = 'approve' | 'reject' | 'return' | 'cancel'

type Props = {
  bookingId: number
  actions: Action[]   // which buttons to show; the server page decides this
}

const LABELS: Record<Action, string> = {
  approve: 'Approve',
  reject: 'Reject',
  return: 'Mark returned',
  cancel: 'Cancel',
}

const STYLES: Record<Action, string> = {
  approve: 'btn-primary',
  reject: 'btn-danger',
  return: 'btn-primary',
  cancel: 'btn-outline',
}

export default function BookingActions({ bookingId, actions }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState<Action | null>(null)
  const [error, setError] = useState('')

  async function handleAction(action: Action) {
    if(action === 'cancel' && !window.confirm('cancel this booking?')) return
    setError('')
    setBusy(action)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        router.refresh()   // re-runs the server page, no full reload
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.message ?? 'Something went wrong')
      }
    } catch {
      setError('Network error, please try again')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {actions.map(action => (
          <button key={action} onClick={() => handleAction(action)} disabled={busy !== null}
            className={STYLES[action]} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
            {busy === action ? 'Working…' : LABELS[action]}
          </button>
        ))}
      </div>
      {error && <p style={{ color: 'var(--danger, #b00020)', marginTop: '8px', fontSize: '0.85rem' }}>{error}</p>}
    </div>
  )
}