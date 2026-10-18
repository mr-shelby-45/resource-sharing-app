'use client'
import { useFeedback } from './Feedback'

export default function LogoutButton() {
  const { toast } = useFeedback()
  async function handleLogout() {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      if (res.ok) { window.location.href = '/login'; return }
      const data = await res.json().catch(() => ({}))
      toast(data.message ?? 'Could not log out', 'error')
    } catch {
      toast('Network error, please try again', 'error')
    }
  }
  return <button onClick={handleLogout} className="btn btn-outline btn-sm">Log out</button>
}
