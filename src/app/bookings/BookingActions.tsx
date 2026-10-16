//client component: the buttons that change a booking's status.
//the server page decides which buttons to show (and checks permissions); the API checks them again.

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ConfirmDialog from '../components/ConfirmDialog'
import { showToast } from '../components/toast'

type Action = 'approve' | 'reject' | 'return' | 'cancel'

type Props = {
  bookingId: number
  actions: Action[]   // which buttons to show; the server page decides this
  who?: string        // first name of the other person, used in the confirmation message
}

const LABELS: Record<Action, string> = {
  approve: 'Approve',
  reject: 'Decline',
  return: 'Mark returned',
  cancel: 'Cancel request',
}

const STYLES: Record<Action, string> = {
  approve: 'btn-primary',
  reject: 'btn-danger',
  return: 'btn-outline',
  cancel: 'btn-outline',
}

// destructive actions ask first, in a dialog
const CONFIRM: Partial<Record<Action, { title: string; body: string; confirm: string; keep: string }>> = {
  reject: { title: 'Decline this request?', body: 'They will see it as declined.', confirm: 'Decline request', keep: 'Keep request' },
  cancel: { title: 'Cancel this request?', body: 'The other person will see that it was cancelled.', confirm: 'Cancel request', keep: 'Keep it' },
}

function doneMessage(action: Action, who?: string) {
  switch (action) {
    case 'approve': return who ? `Approved. ${who} will see it under Requests.` : 'Approved.'
    case 'reject': return who ? `Declined. ${who} will see it under Requests.` : 'Declined.'
    case 'return': return 'Marked returned.'
    case 'cancel': return 'Request cancelled.'
  }
}

export default function BookingActions({ bookingId, actions, who }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState<Action | null>(null)
  const [asking, setAsking] = useState<Action | null>(null)
  const [error, setError] = useState('')

  async function run(action: Action) {
    setError('')
    setBusy(action)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        setAsking(null)
        showToast(doneMessage(action, who))
        router.refresh()   // re-runs the server page, no full reload
      } else {
        const data = await res.json().catch(() => ({}))
        setAsking(null)
        setError(data.message ?? 'That did not go through. Try again.')
      }
    } catch {
      setAsking(null)
      setError('No connection. Check your network and try again.')
    } finally {
      setBusy(null)
    }
  }

  function handleClick(action: Action) {
    if (CONFIRM[action]) setAsking(action)
    else run(action)
  }

  const ask = asking ? CONFIRM[asking] : undefined

  return (
    <div>
      <div className="actions">
        {actions.map(action => (
          <button key={action} type="button" onClick={() => handleClick(action)} disabled={busy !== null}
            className={STYLES[action]}>
            {busy === action && !CONFIRM[action] ? 'Working…' : LABELS[action]}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="inline-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
          </svg>
          {error}
        </p>
      )}
      <ConfirmDialog
        open={asking !== null}
        title={ask?.title ?? ''}
        body={ask?.body ?? ''}
        confirmLabel={ask?.confirm ?? ''}
        keepLabel={ask?.keep ?? ''}
        busy={busy !== null}
        onConfirm={() => asking && run(asking)}
        onClose={() => setAsking(null)}
      />
    </div>
  )
}
