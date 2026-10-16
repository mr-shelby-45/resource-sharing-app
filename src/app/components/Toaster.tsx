'use client'
import { useEffect, useState } from 'react'

type Toast = { id: number; message: string }

// Success feedback for status changes. Polite live region, dismissible, auto-clears after 5 seconds.
export default function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    let counter = 0
    function onToast(e: Event) {
      const id = ++counter
      const message = String((e as CustomEvent).detail)
      setToasts(current => [...current.slice(-2), { id, message }])
      setTimeout(() => setToasts(current => current.filter(t => t.id !== id)), 5000)
    }
    window.addEventListener('jirani:toast', onToast)
    return () => window.removeEventListener('jirani:toast', onToast)
  }, [])

  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map(t => (
        <div className="toast" key={t.id}>
          <p>{t.message}</p>
          <button type="button" aria-label="Dismiss" onClick={() => setToasts(c => c.filter(x => x.id !== t.id))}>×</button>
        </div>
      ))}
    </div>
  )
}
