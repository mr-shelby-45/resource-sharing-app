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
    <Section title="Needs your action" count={bookings.length} narrow>
      <div className="rows">
        {bookings.map(booking => {
          const overdue = isOverdue(booking)
          const name = booking.borrower.name
          return (
            <BookingRow key={booking.id} booking={booking} hideStatus
              subtitle={overdue ? `Return overdue since ${formatDay(booking.endDate)}` : `${name} asked to borrow this`}
              subtitleTone={overdue ? 'danger' : undefined}
              details={
                <p className="text-sm muted contact">
                  {overdue ? `${name} has it` : name}{' · '}
                  <a href={`mailto:${booking.borrower.email}`}>{booking.borrower.email}</a>{' · '}
                  <a href={`tel:${booking.borrower.phone}`}>{booking.borrower.phone}</a>
                </p>
              }
              aside={<BookingActions bookingId={booking.id} actions={overdue ? ['return'] : ['approve', 'reject']} />} />
          )
        })}
      </div>
    </Section>
  )
}
