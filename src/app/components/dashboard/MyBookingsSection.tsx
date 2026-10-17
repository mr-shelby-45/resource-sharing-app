import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Section from '../Section'
import EmptyState from '../EmptyState'
import BookingRow from '../BookingRow'

// the viewer's own requests, soonest first; returned and cancelled ones live on the Bookings page
export default async function MyBookingsSection({ userId }: { userId: number }) {
  const bookings = await prisma.booking.findMany({
    where: { borrowerId: userId, status: { notIn: ['RETURNED', 'CANCELLED'] } },
    include: { item: true },
    orderBy: { startDate: 'asc' },
  })

  return (
    <Section title="My Bookings">
      {bookings.length === 0
        ? <EmptyState message="No bookings yet. Request an item above." />
        : (
          <div className="stack">
            {bookings.map(booking => <BookingRow key={booking.id} booking={booking} subtitle={booking.item.description} />)}
          </div>
        )}
      <p className="section-link"><Link href="/bookings">All bookings and history →</Link></p>
    </Section>
  )
}
