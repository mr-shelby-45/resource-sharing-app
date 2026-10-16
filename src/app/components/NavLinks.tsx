'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname()
  return (
    <nav className="nav-links" aria-label="Main">
      {links.map(link => {
        const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
        return (
          <Link key={link.href} href={link.href} className="nav-link" aria-current={active ? 'page' : undefined}>
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
