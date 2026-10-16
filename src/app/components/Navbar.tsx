import Link from 'next/link'
import { getCurrentUser } from '@/lib/currentUser'
import LogoutButton from './LogoutButton'
import NavLinks from './NavLinks'

// Role-aware top bar. Phones: wordmark and account on the first row, links scroll on the second.
export default async function Navbar() {
  const user = await getCurrentUser()

  const links = user
    ? [
        { href: '/', label: 'Home' },
        { href: '/items', label: 'Browse' },
        { href: '/bookings', label: 'Requests' },
        ...(user.canList ? [{ href: '/items/new', label: 'Add item' }] : []),
      ]
    : []

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="wordmark">Jirani</Link>
        {user ? (
          <>
            <NavLinks links={links} />
            <div className="nav-user">
              <span className="small muted">{user.name.split(' ')[0]}</span>
              <LogoutButton />
            </div>
          </>
        ) : (
          <div className="nav-user">
            <Link href="/login" className="nav-link">Log in</Link>
            <Link href="/register" className="btn-primary">Register</Link>
          </div>
        )}
      </div>
    </header>
  )
}
