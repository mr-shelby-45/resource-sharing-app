'use client'
import { useEffect, useId, useRef } from 'react'

type Props = {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  keepLabel: string
  busy?: boolean
  onConfirm: () => void
  onClose: () => void
}

// Styled replacement for window.confirm. Uses the native <dialog>: focus is trapped inside,
// Esc closes it, and focus returns to the button that opened it.
// Clicking the backdrop does not close it, because the action is destructive.
export default function ConfirmDialog({ open, title, body, confirmLabel, keepLabel, busy, onConfirm, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={ref} className="dialog" aria-labelledby={titleId} onClose={onClose}>
      <h2 id={titleId}>{title}</h2>
      <p>{body}</p>
      <div className="dialog-actions">
        <button type="button" className="btn-outline" onClick={onClose} disabled={busy}>{keepLabel}</button>
        <button type="button" className="btn-danger-solid" onClick={onConfirm} disabled={busy}>
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
