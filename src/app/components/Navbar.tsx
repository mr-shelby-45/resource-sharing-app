import Link from 'next/link'
import { getCurrentUser } from '@/lib/currentUser'
import { countOwnerActions } from '@/lib/ownerActions'
import LogoutButton from './LogoutButton'
import NavLink from './NavLink'
import ThemeToggle from './ThemeToggle'

// Top bar. Brand and page links on the left, who you are and logout on the right.
export default async function NavBar() {
  const user = await getCurrentUser()
  // owners see how many things are waiting for them on Home
  const actionCount = user?.canList ? await countOwnerActions(user.id) : 0

  return (
    <nav className="navbar">
      <div className="navbar-inner">
      <div className="navbar-group">
        <Link href="/" className="navbar-brand">Jirani</Link>
        {user && (
          <>
            <NavLink href="/">
              Home
              {actionCount > 0 && <span className="navbar-count" aria-label={`${actionCount} need your action`}>{actionCount}</span>}
            </NavLink>
            <NavLink href="/items">Browse</NavLink>
            <NavLink href="/bookings">Requests</NavLink>
            <NavLink href="/payments">Payments</NavLink>
          </>
        )}
      </div>

      <div className="navbar-group">
        {user
          ? (
            <>
              <ThemeToggle />
              <span className="navbar-user">{user.name}</span>
              <LogoutButton />
            </>
          )
          : (
            <>
              <ThemeToggle />
              <Link href="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link href="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
      </div>
      </div>
    </nav>
  )
}
