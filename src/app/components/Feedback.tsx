'use client'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

type ConfirmOptions = { title: string; body?: string; confirmLabel?: string; danger?: boolean }
type Toast = { id: number; message: string; tone: 'info' | 'error' }
type Ctx = {
  toast: (message: string, tone?: 'info' | 'error') => void
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const FeedbackContext = createContext<Ctx | null>(null)

// replaces window.alert (toast) and window.confirm (dialog) everywhere in the app
export function useFeedback(): Ctx {
  const ctx = useContext(FeedbackContext)
  if (!ctx) throw new Error('useFeedback must be used inside <FeedbackProvider>')
  return ctx
}

export default function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [pending, setPending] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const nextId = useRef(1)

  const toast = useCallback((message: string, tone: 'info' | 'error' = 'info') => {
    const id = nextId.current++
    setToasts(list => [...list, { id, message, tone }])
    setTimeout(() => setToasts(list => list.filter(t => t.id !== id)), tone === 'error' ? 6000 : 3500)
  }, [])

  const confirm = useCallback((options: ConfirmOptions) =>
    new Promise<boolean>(resolve => setPending({ ...options, resolve })), [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (pending && dialog && !dialog.open) dialog.showModal()
  }, [pending])

  function answer(ok: boolean) {
    pending?.resolve(ok)
    dialogRef.current?.close()
    setPending(null)
  }

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}
      <dialog ref={dialogRef} className="dialog" aria-labelledby="dialog-title"
        onCancel={e => { e.preventDefault(); answer(false) }}
        onClick={e => { if (e.target === dialogRef.current) answer(false) }}>
        {pending && (
          <div className="stack">
            <h2 id="dialog-title">{pending.title}</h2>
            {pending.body && <p className="muted">{pending.body}</p>}
            <div className="dialog-actions">
              <button type="button" className="btn btn-outline" onClick={() => answer(false)}>Keep it</button>
              <button type="button" className={`btn ${pending.danger ? 'btn-danger-solid' : 'btn-primary'}`}
                onClick={() => answer(true)}>{pending.confirmLabel ?? 'Confirm'}</button>
            </div>
          </div>
        )}
      </dialog>
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map(t => <div key={t.id} className={`toast toast-${t.tone}`}>{t.message}</div>)}
      </div>
    </FeedbackContext.Provider>
  )
}
