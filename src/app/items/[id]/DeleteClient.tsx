'use client'
import { useState, useTransition } from 'react'
import { handleDelete } from "./DeleteButton"
import ConfirmDialog from '../../components/ConfirmDialog'

export default function DeleteButtonClient({ itemId }: { itemId: number }) {
  const [asking, setAsking] = useState(false)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function confirmDelete() {
    setError('')
    startTransition(async () => {
      // on success the server action redirects, so we only handle the error case
      const result = await handleDelete(itemId)
      if (result?.error) {
        setAsking(false)
        setError(result.error)
      }
    })
  }

  return (
    <div>
      <button type="button" className="btn-danger" onClick={() => setAsking(true)}>Remove item</button>
      {error && (
        <p role="alert" className="inline-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
          </svg>
          {error}
        </p>
      )}
      <ConfirmDialog
        open={asking}
        title="Remove this item?"
        body="Neighbours will no longer see it. Past requests stay in your history."
        confirmLabel="Remove item"
        keepLabel="Keep item"
        busy={pending}
        onConfirm={confirmDelete}
        onClose={() => setAsking(false)}
      />
    </div>
  )
}
