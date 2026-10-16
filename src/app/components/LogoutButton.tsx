'use client'
import { useState } from 'react'

export default function LogoutButton() {
  const [error, setError] = useState('')

  async function handleLogout() {
    setError('')
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        window.location.href = '/login'
      } else {
        setError('Could not log out. Try again.')
      }
    } catch {
      setError('No connection. Try again.')
    }
  }

  return (
    <>
      <button type="button" onClick={handleLogout} className="btn-outline">Log out</button>
      {error && <span role="alert" className="small" style={{ color: 'var(--danger)' }}>{error}</span>}
    </>
  )
}
