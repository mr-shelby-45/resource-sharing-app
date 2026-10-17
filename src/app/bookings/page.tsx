// Server component. Splits the viewer's bookings into the sections they act on,
// and decides which buttons each booking gets. Buttons themselves live in BookingActions (client).

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/currentUser'
import BookingActions from './BookingActions'
import BookingRow from '../components/BookingRow'
import PageHeader from '../components/PageHeader'
import Section from '../components/Section'
import EmptyState from '../components/EmptyState'
import Link from 'next/link'
import { canCancelBooking } from '@/lib/permissions'
import { isOverdue } from '@/lib/bookingTasks'
import { countOwnerActions } from '@/lib/ownerActions'

type Action = 'approve' | 'reject' | 'return' | 'cancel'

export default async function BookingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const bookings = await prisma.booking.findMany({
    // admins see everything; everyone else sees bookings they made or bookings on their items
    where: user.isAdmin
      ? {}
      : { OR: [{ borrowerId: user.id }, { item: { ownerId: user.id } }] },
    // contact details are only rendered for the owner's decision cards
    include: { item: true, borrower: { select: { name: true, email: true, phone: true } } },
    orderBy: { startDate: 'asc' },   // soonest first
  })

  const actionCount = user.canList ? await countOwnerActions(user.id) : 0

  type B = (typeof bookings)[number]

  const isFinished = (b: B) => b.status === 'RETURNED' || b.status === 'CANCELLED'
  const isMine = (b: B) => b.borrowerId === user.id                  // I asked to borrow it
  // the owner side: my item, or an admin looking at someone else's booking
  const isOnMyItem = (b: B) => !isMine(b) && (b.item.ownerId === user.id || user.isAdmin)

  // On Home the owner answers new requests and overdue returns. Here we show what is out and what they asked for.
  const lentOut = bookings.filter(b => b.status === 'APPROVED' && isOnMyItem(b))
  // admins moderate pending requests on other people's items from here (their own items are answered on Home)
  const adminPending = user.isAdmin
    ? bookings.filter(b => b.status === 'PENDING' && !isMine(b) && b.item.ownerId !== user.id)
    : []
  const myRequests = bookings.filter(b => isMine(b) && !isFinished(b))
  const history = bookings.filter(isFinished).reverse()   // newest first

  const cancelAction = (b: B): Action[] => (canCancelBooking(user, b, b.item).allowed ? ['cancel'] : [])

  const row = (b: B, actions: Action[], opts?: { contact?: boolean }) => (
    <BookingRow key={b.id} booking={b}
      subtitle={isMine(b)
        ? b.item.description
        : isOverdue(b) ? `Requested by ${b.borrower.name} · Return overdue` : `Requested by ${b.borrower.name}`}
      details={opts?.contact && (
        <div className="panel">
          <p className="strong">{b.borrower.name}</p>
          <p className="muted text-sm">{b.borrower.email}</p>
          <p className="muted text-sm">{b.borrower.phone}</p>
        </div>
      )}
      actions={actions.length > 0 ? <BookingActions bookingId={b.id} actions={actions} /> : undefined} />
  )

  return (
    <div className="page">
      <PageHeader title="Requests" subtitle="Items you have lent out and the requests you made" />

      {actionCount > 0 && (
        <p className="notice">
          {actionCount} {actionCount === 1 ? 'thing needs' : 'things need'} your action. <Link href="/">Go to Home →</Link>
        </p>
      )}

      {adminPending.length > 0 && (
        <Section title="Pending on other items (admin)">
          <div className="stack">{adminPending.map(b => row(b, ['approve', 'reject'], { contact: true }))}</div>
        </Section>
      )}

      {lentOut.length > 0 && (
        <Section title="Lent out">
          <div className="stack">{lentOut.map(b => row(b, ['return', ...cancelAction(b)]))}</div>
        </Section>
      )}

      <Section title="Your requests">
        {myRequests.length === 0
          ? <EmptyState message="You have not requested anything yet. Browse the community to find an item." />
          : <div className="stack">{myRequests.map(b => row(b, cancelAction(b)))}</div>}
      </Section>

      {history.length > 0 && (
        <details className="history">
          <summary className="muted">History ({history.length})</summary>
          <div className="stack history-list">{history.map(b => row(b, []))}</div>
        </details>
      )}
    </div>
  )
}
