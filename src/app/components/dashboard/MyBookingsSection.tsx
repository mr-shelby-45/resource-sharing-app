import Link from 'next/link'
import type { User } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import Section from '../Section'
import EmptyState from '../EmptyState'
import BookingRow from '../BookingRow'
import BookingActions from '../../bookings/BookingActions'
import { canCancelBooking } from '@/lib/permissions'
import { amountDue, payState } from '@/lib/payments'
import { paymentNote } from '@/lib/paymentLabels'

// the viewer's own requests, soonest first; returned and cancelled ones live on the Bookings page
export default async function MyBookingsSection({ user }: { user: User }) {
  const bookings = await prisma.booking.findMany({
    where: { borrowerId: user.id, status: { notIn: ['RETURNED', 'CANCELLED'] } },
    include: { item: true, payment: true },
    orderBy: { startDate: 'asc' },
  })

  return (
    <Section title="My bookings" narrow action={<Link href="/bookings" className="section-link-inline">All bookings and history</Link>}>
      {bookings.length === 0
        ? <EmptyState message="No bookings yet. Browse the community to find something to borrow." />
        : (
          <div className="rows">
            {bookings.map(booking => {
              const mustPay = booking.status === 'APPROVED' && payState(booking, booking.payment) === 'AWAITING'
              const actions: ('pay' | 'cancel')[] = [
                ...(mustPay ? ['pay' as const] : []),
                ...(canCancelBooking(user, booking, booking.item).allowed ? ['cancel' as const] : []),
              ]
              return (
                <BookingRow key={booking.id} booking={booking} subtitle={booking.item.description}
                  payment={paymentNote('borrower', booking, booking.payment)}
                  actions={actions.length > 0
                    ? <BookingActions bookingId={booking.id} actions={actions} payLabel={`Pay KES ${amountDue(booking).toLocaleString('en-KE')}`} />
                    : undefined} />
              )
            })}
          </div>
        )}
    </Section>
  )
}
