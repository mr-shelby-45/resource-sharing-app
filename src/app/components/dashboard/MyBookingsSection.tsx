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
    <Section title="My bookings" narrow action={<Link href="/bookings" className="section-link-inline">All bookings and history</Link>}>
      {bookings.length === 0
        ? <EmptyState message="No bookings yet. Browse the community to find something to borrow." />
        : (
          <div className="rows">
            {bookings.map(booking => <BookingRow key={booking.id} booking={booking} subtitle={booking.item.description} />)}
          </div>
        )}
    </Section>
  )
}
