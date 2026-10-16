'use client'
import { useEffect } from 'react'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="wrap">
      <h1>This page did not load</h1>
      <p className="muted" style={{ marginTop: 'var(--space-2)' }}>
        We could not load it. Check your connection and try again.
      </p>
      <div style={{ marginTop: 'var(--space-5)' }}>
        <button type="button" className="btn-primary" onClick={reset}>Try again</button>
      </div>
    </div>
  )
}
