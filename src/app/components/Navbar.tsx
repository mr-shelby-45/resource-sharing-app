import Link from 'next/link'
import { getCurrentUser } from '@/lib/currentUser'
import LogoutButton from './LogoutButton'

// Top bar. Brand and page links on the left, who you are and logout on the right.
export default async function NavBar() {
  const user = await getCurrentUser()

  return (
    <nav className="navbar">
      <div className="navbar-group">
        <Link href="/" className="navbar-brand">Jirani</Link>
        {user && (
          <>
            <Link href="/" className="navbar-link">Home</Link>
            <Link href="/items" className="navbar-link">Browse</Link>
            <Link href="/bookings" className="navbar-link">Requests</Link>
          </>
        )}
      </div>

      <div className="navbar-group">
        {user
          ? (
            <>
              <span className="navbar-user">{user.name}</span>
              <LogoutButton />
            </>
          )
          : (
            <>
              <Link href="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link href="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
      </div>
    </nav>
  )
}
