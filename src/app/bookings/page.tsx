//server component to fetch bookings,render intial page
//ensures the client component only has approve/reject buttons, event handlers, UI updates after actions -> js bundle to the browser is small improving SEO and faster loads.
import { bookings, items } from '@/app/api/data'
import BookingActions from './BookingActions'

export default function BookingsPage() {
  return (
    <div>
      <h1>Bookings</h1>

      <ul>
        {bookings.map(booking => {
          const item = items.find(i => i.id === booking.itemId)

          return (
            <li key={booking.id}>
              <p>Item: {item?.title}</p>
              <p>Status: {booking.status}</p>

              {booking.status === 'pending' && (
                <BookingActions bookingId={booking.id} />
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}