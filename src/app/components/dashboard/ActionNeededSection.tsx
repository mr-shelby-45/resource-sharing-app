import { prisma } from '@/lib/prisma'
import { ownerActionWhere, isOverdue } from '@/lib/bookingTasks'
import { formatDay } from '@/lib/format'
import Section from '../Section'
import BookingRow from '../BookingRow'
import BookingActions from '../../bookings/BookingActions'

// Everything on the owner's items that is waiting for them:
// new requests to answer, and items past their return date. Hidden when there is nothing.
export default async function ActionNeededSection({ userId }: { userId: number }) {
  const bookings = await prisma.booking.findMany({
    where: ownerActionWhere(userId),
    // only the contact details the owner needs, never the whole user record
    include: { item: true, borrower: { select: { name: true, email: true, phone: true } } },
    orderBy: { startDate: 'asc' },
  })

  if (bookings.length === 0) return null

  return (
    <Section title={`Needs your action (${bookings.length})`}>
      <div className="stack">
        {bookings.map(booking => {
          const overdue = isOverdue(booking)
          return (
            <BookingRow key={booking.id} booking={booking}
              subtitle={overdue
                ? `Return overdue since ${formatDay(booking.endDate)}`
                : `Requested by ${booking.borrower.name}`}
              details={
                <div className="panel">
                  <p className="strong">{booking.borrower.name}</p>
                  <p className="muted text-sm">{booking.borrower.email}</p>
                  <p className="muted text-sm">{booking.borrower.phone}</p>
                </div>
              }
              actions={<BookingActions bookingId={booking.id} actions={overdue ? ['return'] : ['approve', 'reject']} />} />
          )
        })}
      </div>
    </Section>
  )
}
