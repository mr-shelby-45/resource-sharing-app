//client component that the owner accepts or rejects a booking.
//booking is split into a server and client 
//bookingActions - client buttons, eventhandler
//pages -> fetches the bookings, conditional rendering.

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFeedback } from '@/app/components/Feedback'

type Action = 'approve' | 'reject' | 'return' | 'cancel'

type Props = {
  bookingId: number
  actions: Action[]   // which buttons to show; the server page decides this
}

const LABELS: Record<Action, string> = {
  approve: 'Approve',
  reject: 'Decline',
  return: 'Mark returned',
  cancel: 'Cancel',
}

const SUCCESS: Record<Action, string> = {
  approve: 'Request approved',
  reject: 'Request declined',
  return: 'Marked as returned',
  cancel: 'Booking cancelled',
}

const STYLES: Record<Action, string> = {
  approve: 'btn-primary',
  reject: 'btn-outline',
  return: 'btn-primary',
  cancel: 'btn-outline',
}

export default function BookingActions({ bookingId, actions }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState<Action | null>(null)
  const [error, setError] = useState('')
  const { confirm, toast } = useFeedback()

  async function handleAction(action: Action) {
    if (action === 'cancel' && !(await confirm({
      title: 'Cancel this booking?', body: 'The dates will become free for other people.',
      confirmLabel: 'Cancel booking', danger: true,
    }))) return
    setError('')
    setBusy(action)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        toast(SUCCESS[action])
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
      <div className="cluster">
        {actions.map(action => (
          <button key={action} onClick={() => handleAction(action)} disabled={busy !== null}
            className={`btn ${STYLES[action]}`}>
            {busy === action ? 'Working…' : LABELS[action]}
          </button>
        ))}
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  )
}