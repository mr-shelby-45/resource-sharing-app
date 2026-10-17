import { prisma } from '@/lib/prisma'
import Section from '../Section'
import EmptyState from '../EmptyState'
import BookingRow from '../BookingRow'
import BookingActions from '../../bookings/BookingActions'

// requests on this owner's items that are waiting for an answer
export default async function PendingRequestsSection({ userId }: { userId: number }) {
  const requests = await prisma.booking.findMany({
    where: { status: 'PENDING', item: { ownerId: userId } },
    // only the contact details the owner needs, never the whole user record
    include: { item: true, borrower: { select: { name: true, email: true, phone: true } } },
    orderBy: { startDate: 'asc' },
  })

  return (
    <Section title="Pending Requests">
      {requests.length === 0
        ? <EmptyState message="No pending booking requests" />
        : (
          <div className="stack">
            {requests.map(booking => (
              <BookingRow key={booking.id} booking={booking} subtitle={booking.item.description}
                details={
                  <div className="panel">
                    <p className="strong">{booking.borrower.name}</p>
                    <p className="muted text-sm">{booking.borrower.email}</p>
                    <p className="muted text-sm">{booking.borrower.phone}</p>
                  </div>
                }
                actions={<BookingActions bookingId={booking.id} actions={['approve', 'reject']} />} />
            ))}
          </div>
        )}
    </Section>
  )
}
