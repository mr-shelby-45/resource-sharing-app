//server component to fetch bookings,render intial page, reducing the js bundle sent to the browser in the client component
//ensures the client component only has approve/reject buttons, event handlers, UI updates after actions -> js bundle to the browser is small improving SEO and faster loads. 

//server component: fetches the viewer's bookings and decides which buttons each one gets

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/currentUser'
import BookingActions from './BookingActions'
import BookingRow from '../components/BookingRow'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
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
      <BookingRow key={booking.id} booking={booking}
        subtitle={isBorrower ? undefined : `Requested by ${booking.borrower.name}`}
        actions={actions.length > 0 ? <BookingActions bookingId={booking.id} actions={actions} /> : undefined} />
    )
  }

  return (
    <div className="page">
      <PageHeader title="Bookings" subtitle="Requests you made and requests on your items" />

      {bookings.length === 0
        ? <EmptyState message="No bookings yet." />
        : (
          <>
            <div className="stack">
              {current.length === 0
                ? <p className="muted">Nothing active right now.</p>
                : current.map(renderBooking)}
            </div>

            {history.length > 0 && (
              <details className="history">
                <summary className="muted">History ({history.length})</summary>
                <div className="stack history-list">{history.map(renderBooking)}</div>
              </details>
            )}
          </>
        )}
    </div>
  )
}
