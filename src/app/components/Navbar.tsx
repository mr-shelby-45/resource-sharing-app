import Link from 'next/link'
import { getCurrentUser } from '@/lib/currentUser'
import { countOwnerActions } from '@/lib/ownerActions'
import LogoutButton from './LogoutButton'

// Top bar. Brand and page links on the left, who you are and logout on the right.
export default async function NavBar() {
  const user = await getCurrentUser()
  // owners see how many things are waiting for them on Home
  const actionCount = user?.canList ? await countOwnerActions(user.id) : 0

  return (
    <nav className="navbar">
      <div className="navbar-group">
        <Link href="/" className="navbar-brand">Jirani</Link>
        {user && (
          <>
            <Link href="/" className="navbar-link">
              Home
              {actionCount > 0 && <span className="navbar-count" aria-label={`${actionCount} need your action`}>{actionCount}</span>}
            </Link>
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
