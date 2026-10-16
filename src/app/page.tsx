import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/currentUser'
import { todayInNairobi } from '@/lib/dates'
import { formatDay, formatDateRange, formatRate } from '@/lib/format'
import { canCancelBooking } from '@/lib/permissions'
import BookingActions from './bookings/BookingActions'
import BookingDetails from './components/BookingDetails'
import DeleteButtonClient from './items/[id]/DeleteClient'
import StatusPill from './components/StatusPill'
import { ExpandRow, LinkRow } from './components/LedgerRow'

const firstName = (name: string) => name.split(' ')[0]

// "Friday 16 October", in Nairobi time
const todayLabel = () =>
  new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Nairobi' }).format(new Date())

export default async function HomePage() {
  // not logged in, or the account no longer exists
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  if (!user.canBorrow && !user.canList) {
    return (
      <div className="wrap">
        <h1>Hello, {firstName(user.name)}</h1>
        <p className="muted" style={{ marginTop: 'var(--space-2)' }}>
          Your account cannot borrow or list right now. Contact the community admin.
        </p>
      </div>
    )
  }

  const today = todayInNairobi()
  const isOwner = user.canList

  // Owners only: items they list, requests waiting for them, items currently out
  const myItems = isOwner
    ? await prisma.item.findMany({
        where: { ownerId: user.id, deletedAt: null },
        include: { bookings: { where: { status: 'APPROVED', endDate: { gte: today } }, select: { id: true } } },
      })
    : []
  const decisions = isOwner
    ? await prisma.booking.findMany({
        where: { status: 'PENDING', item: { ownerId: user.id } },
        include: { item: true, borrower: { select: { name: true, email: true, phone: true } } },
        orderBy: { startDate: 'asc' },
      })
    : []
  const lentOut = isOwner
    ? await prisma.booking.findMany({
        where: { status: 'APPROVED', item: { ownerId: user.id } },
        include: { item: true, borrower: { select: { name: true } } },
        orderBy: { startDate: 'asc' },
      })
    : []

  // Everyone: requests they made, and the newest items from neighbours
  const myRequests = await prisma.booking.findMany({
    where: { borrowerId: user.id, status: { notIn: ['RETURNED', 'CANCELLED'] } },
    include: { item: { include: { owner: { select: { name: true } } } } },
    orderBy: { startDate: 'asc' },
  })
  const available = await prisma.item.findMany({
    where: { NOT: { ownerId: user.id }, deletedAt: null },
    include: {
      images: { orderBy: { position: 'asc' }, take: 1 },
      bookings: { where: { status: 'APPROVED', endDate: { gte: today } }, select: { id: true } },
      owner: { select: { name: true } },
    },
    orderBy: { id: 'desc' },
    take: 6,
  })

  const lede = isOwner
    ? decisions.length
      ? `${decisions.length} ${decisions.length === 1 ? 'request needs' : 'requests need'} your decision.`
      : 'Nothing needs your decision right now.'
    : 'Find something to borrow, and keep track of your requests.'

  const decisionsSection = (
    <section className="section" aria-labelledby="h-decide">
      <h2 id="h-decide">Needs your decision</h2>
      {decisions.length === 0 ? (
        <p className="empty">No requests are waiting. When a neighbour asks to borrow something of yours, it shows up here.</p>
      ) : (
        <ul className="rows panel">
          {decisions.map(b => (
            <ExpandRow
              key={b.id}
              title={b.item.title}
              meta={`${b.borrower.name} · ${formatDateRange(b.startDate, b.endDate)}`}
              status={<StatusPill status={b.status} as="owner" />}
            >
              <BookingDetails booking={b} />
              <div className="contact">
                <b>{b.borrower.name}</b>
                <span>{b.borrower.email}</span>
                <span>{b.borrower.phone}</span>
              </div>
              <BookingActions bookingId={b.id} actions={['approve', 'reject']} who={firstName(b.borrower.name)} />
            </ExpandRow>
          ))}
        </ul>
      )}
    </section>
  )

  const lentOutSection = lentOut.length > 0 && (
    <section className="section" aria-labelledby="h-out">
      <h2 id="h-out">With neighbours now</h2>
      <ul className="rows">
        {lentOut.map(b => (
          <ExpandRow
            key={b.id}
            title={b.item.title}
            meta={`${b.borrower.name} has it · ${formatDateRange(b.startDate, b.endDate)}${b.endDate < today ? ` · was due back ${formatDay(b.endDate)}` : ''}`}
            status={<StatusPill status={b.status} as="owner" />}
          >
            <BookingDetails booking={b} />
            <BookingActions bookingId={b.id} actions={['return']} who={firstName(b.borrower.name)} />
          </ExpandRow>
        ))}
      </ul>
    </section>
  )

  const requestsSection = (
    <section className="section" aria-labelledby="h-mine">
      <h2 id="h-mine">My requests</h2>
      {myRequests.length === 0 ? (
        <p className="empty">You have not asked to borrow anything yet. Pick something from the list below.</p>
      ) : (
        <ul className="rows">
          {myRequests.map(b => {
            const ownerName = firstName(b.item.owner.name)
            const cancel = canCancelBooking(user, b, b.item).allowed
            return (
              <ExpandRow
                key={b.id}
                title={b.item.title}
                meta={`From ${b.item.owner.name} · ${formatDateRange(b.startDate, b.endDate)}`}
                status={<StatusPill status={b.status} as="borrower" name={ownerName} />}
              >
                <BookingDetails booking={b} noteBy={ownerName} />
                {cancel && <BookingActions bookingId={b.id} actions={['cancel']} who={ownerName} />}
              </ExpandRow>
            )
          })}
        </ul>
      )}
    </section>
  )

  const itemsSection = isOwner && (
    <section className="section" aria-labelledby="h-items">
      <div className="section-head">
        <h2 id="h-items">Your items</h2>
        <Link href="/items/new" className="btn-outline">Add item</Link>
      </div>
      {myItems.length === 0 ? (
        <p className="empty">You have not listed anything yet. <Link href="/items/new">Add your first item</Link>.</p>
      ) : (
        <ul className="rows">
          {myItems.map(item => (
            <ExpandRow
              key={item.id}
              title={item.title}
              meta={formatRate(item.dailyRate)}
              status={item.bookings.length > 0 ? <span className="pill">Taken on some dates</span> : null}
            >
              <p>{item.description}</p>
              <div className="actions">
                <Link href={`/items/${item.id}`} className="btn-outline">Open item</Link>
                <DeleteButtonClient itemId={item.id} />
              </div>
            </ExpandRow>
          ))}
        </ul>
      )}
    </section>
  )

  const availableSection = (
    <section className="section" aria-labelledby="h-available">
      <div className="section-head">
        <h2 id="h-available">From your neighbours</h2>
        <Link href="/items" className="btn-outline">Browse all items</Link>
      </div>
      {available.length === 0 ? (
        <p className="empty">No items from your neighbours yet. Check back soon.</p>
      ) : (
        <ul className="rows">
          {available.map(item => (
            <LinkRow
              key={item.id}
              href={`/items/${item.id}`}
              title={item.title}
              description={item.description}
              imageUrl={item.images[0]?.url}
              meta={
                <>
                  <span>{formatRate(item.dailyRate)} · Lent by {firstName(item.owner.name)}</span>
                  {item.bookings.length > 0 && <span className="pill">Taken on some dates</span>}
                </>
              }
            />
          ))}
        </ul>
      )}
    </section>
  )

  return (
    <div className="wrap">
      <p className="label">{todayLabel()}</p>
      <h1 style={{ marginTop: 'var(--space-1)' }}>Hello, {firstName(user.name)}</h1>
      <p className="muted" style={{ marginTop: 'var(--space-1)' }}>{lede}</p>

      {isOwner && decisionsSection}
      {isOwner && lentOutSection}
      {requestsSection}
      {itemsSection}
      {availableSection}
    </div>
  )
}
