import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verify } from "jsonwebtoken"
import Link from 'next/link'
import LogoutButton from "./LogoutButton"

export default async function NavBar() {
  const cookiesStore = await cookies()
  const token = cookiesStore.get('token')?.value

  const guestNav = (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow)'
    }}>
      <Link href="/" style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: '1.3rem',
        fontWeight: '700',
        color: 'var(--primary)',
        letterSpacing: '-0.5px'
      }}>
        Jirani
      </Link>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Link href="/login">
          <button className="btn-outline" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
            Login
          </button>
        </Link>
        <Link href="/register">
          <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
            Register
          </button>
        </Link>
      </div>
    </nav>
  )

  if (!token) return guestNav

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: number, role: string }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) return guestNav

    return (
      <nav style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow)'
      }}>
        <Link href="/" style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '1.3rem',
          fontWeight: '700',
          color: 'var(--primary)',
          letterSpacing: '-0.5px'
        }}>
          Jirani
        </Link>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link href="/" style={{
            color: 'var(--text-muted)',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}>
            Home
          </Link>
          {user.role === 'OWNER' && (
            <Link href="/items/new" style={{
              color: 'var(--text-muted)',
              fontSize: '0.95rem',
              fontWeight: '500'
            }}>
              Add Item
            </Link>
          )}
          <div style={{
            width: '1px',
            height: '20px',
            background: 'var(--border)'
          }} />
          <span style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            fontWeight: '500'
          }}>
            {user.name}
          </span>
          <LogoutButton />
        </div>
      </nav>
    )
  } catch {
    return guestNav
  }
}