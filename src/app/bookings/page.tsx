//server component to fetch bookings,render intial page, reducing the js bundle sent to the browser in the client component
//ensures the client component only has approve/reject buttons, event handlers, UI updates after actions -> js bundle to the browser is small improving SEO and faster loads. 

import { prisma } from '@/lib/prisma'
import BookingActions from './BookingActions'

export default async function BookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: {
      item: true //alongside fetching the booking(has an itemId property already), also fetch the item object(includes item's id,title,desccription and avilability)
    }
  })
  return (
    <div>
      <h1>Bookings</h1>
      <ul>
        {bookings.map(booking => (
          <li key={booking.id}>
            <p>Item: {booking.item.title}</p>
            <p>Status: {booking.status}</p>
            {booking.status === 'PENDING' && (
              <BookingActions bookingId={booking.id} />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}