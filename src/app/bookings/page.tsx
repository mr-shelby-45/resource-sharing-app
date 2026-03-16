//server component to fetch bookings,render intial page, reducing the js bundle sent to the browser in the client component
//ensures the client component only has approve/reject buttons, event handlers, UI updates after actions -> js bundle to the browser is small improving SEO and faster loads. 

import { prisma } from '@/lib/prisma'
import BookingActions from './BookingActions'

export default async function BookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: {
      item: true //alongside fetching the booking(has an itemId relation in the schema), also fetch the item object(includes item's id,title,desccription and avilability)
    }
  })

  return (
    <div className="page">
      <div style={{ marginBottom: '32px' }}>
        <h1>Bookings</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>
          All booking requests across your community
        </p>
      </div>

      {bookings.length === 0
        ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <p>No bookings yet.</p>
          </div>
        )
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bookings.map(booking => (
              <div key={booking.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: booking.status === 'PENDING' ? '16px' : '0' }}>
                  <div>
                    <p style={{ fontWeight: '500', marginBottom: '4px' }}>{booking.item.title}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{booking.item.description}</p>
                  </div>
                  <span className={`badge badge-${booking.status.toLowerCase()}`}>
                    {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                  </span>
                </div>
                {booking.status === 'PENDING' && (
                  <BookingActions bookingId={booking.id} />
                )}
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}