import Link from 'next/link'
import type { User } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import Section from '../Section'
import EmptyState from '../EmptyState'
import BookingRow from '../BookingRow'
import BookingActions from '../../bookings/BookingActions'
import { canCancelBooking } from '@/lib/permissions'

// the viewer's own requests, soonest first; returned and cancelled ones live on the Bookings page
export default async function MyBookingsSection({ user }: { user: User }) {
  const bookings = await prisma.booking.findMany({
    where: { borrowerId: user.id, status: { notIn: ['RETURNED', 'CANCELLED'] } },
    include: { item: true },
    orderBy: { startDate: 'asc' },
  })

  return (
    <Section title="My bookings" narrow action={<Link href="/bookings" className="section-link-inline">All bookings and history</Link>}>
      {bookings.length === 0
        ? <EmptyState message="No bookings yet. Browse the community to find something to borrow." />
        : (
          <div className="rows">
            {bookings.map(booking => (
              <BookingRow key={booking.id} booking={booking} subtitle={booking.item.description}
                actions={canCancelBooking(user, booking, booking.item).allowed
                  ? <BookingActions bookingId={booking.id} actions={['cancel']} />
                  : undefined} />
            ))}
          </div>
        )}
    </Section>
  )
}
