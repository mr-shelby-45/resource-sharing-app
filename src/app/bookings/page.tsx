//server component to fetch bookings,render intial page, reducing the js bundle sent to the browser in the client component
//ensures the client component only has approve/reject buttons, event handlers, UI updates after actions -> js bundle to the browser is small improving SEO and faster loads. 

//server component: fetches the viewer's bookings and decides which buttons each one gets

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/currentUser'
import BookingActions from './BookingActions'
import BookingDetails from '../components/BookingDetails'
import { canCancelBooking } from '@/lib/permissions'

export default async function BookingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const bookings = await prisma.booking.findMany({
    // admins see everything; everyone else sees bookings they made or bookings on their items
    where: user.isAdmin
      ? {}
      : { OR: [{ borrowerId: user.id }, { item: { ownerId: user.id } }] },
    include: { item: true, borrower: { select: { name: true } } },
    orderBy: { startDate: 'asc' },   // soonest first
  })

  // finished bookings go into a collapsed History section
  const isFinished = (status: string) => status === 'RETURNED' || status === 'CANCELLED'
  const current = bookings.filter(b => !isFinished(b.status))
  const history = bookings.filter(b => isFinished(b.status)).reverse()   // newest first

  // one card, used by both lists
  const renderBooking = (booking: (typeof bookings)[number]) => {
    const isOwner = booking.item.ownerId === user.id || user.isAdmin
    const isBorrower = booking.borrowerId === user.id

    const actions: ('approve' | 'reject' | 'return' | 'cancel')[] = []
    if (booking.status === 'PENDING' && isOwner) actions.push('approve', 'reject')
    if (canCancelBooking(user, booking, booking.item).allowed) actions.push('cancel')
    if (booking.status === 'APPROVED' && isOwner) actions.push('return')

    return (
      <div key={booking.id} className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: actions.length ? '16px' : '0' }}>
          <div>
            <Link href={`/items/${booking.item.id}`} style={{ fontWeight: '500' }}>{booking.item.title}</Link>
            {!isBorrower && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Requested by {booking.borrower.name}</p>
            )}
            <BookingDetails booking={booking} />
          </div>
          <span className={`badge badge-${booking.status.toLowerCase()}`}>
            {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
          </span>
        </div>
        {actions.length > 0 && <BookingActions bookingId={booking.id} actions={actions} />}
      </div>
    )
  }

  return (
    <div className="page">
      <div style={{ marginBottom: '32px' }}>
        <h1>Bookings</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>
          Requests you made and requests on your items
        </p>
      </div>

      {bookings.length === 0
        ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <p>No bookings yet.</p>
          </div>
        )
        : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {current.length === 0
                ? <p style={{ color: 'var(--text-muted)' }}>Nothing active right now.</p>
                : current.map(renderBooking)}
            </div>

            {history.length > 0 && (
              <details style={{ marginTop: '32px' }}>
                <summary style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
                  History ({history.length})
                </summary>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                  {history.map(renderBooking)}
                </div>
              </details>
            )}
          </>
        )
      }
    </div>
  )
}