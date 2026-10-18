'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// a nav link that marks itself when you are on that page
export default function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const path = usePathname()
  const active = href === '/' ? path === '/' : path === href || path.startsWith(href + '/')
  return (
    <Link href={href} className={`navbar-link${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}>
      {children}
    </Link>
  )
}
