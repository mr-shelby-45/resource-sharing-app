//client component that the owner accepts or rejects a booking.
//booking is split into a server and client 
//bookingActions - client buttons, eventhandler
//pages -> fetches the bookings, conditional rendering.

'use client'

type Props = {
  bookingId: number
}

export default function BookingActions({ bookingId }: Props) {
  async function handleAction(action: 'approve' | 'reject') {
    await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    })
    //temporary refresh
    window.location.reload()
  }

  return (
    <div>
      <button onClick={() => handleAction('approve')}>Approve</button>
      <button onClick={() => handleAction('reject')}>Reject</button>
    </div>
  )
}