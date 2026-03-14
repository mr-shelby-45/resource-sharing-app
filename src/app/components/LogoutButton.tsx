'use client'

export default function LogoutButton() {
  async function handleLogout() {
    const res = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type' : 'application/json'}
      })
    if(res.ok) {
      alert('logout successful!')
      window.location.href = ('/login')
    } else {
      const data = await res.json()
      alert(data.message)
    }
  }
  return (
    <button onClick={handleLogout}>Log out</button>
  )
}