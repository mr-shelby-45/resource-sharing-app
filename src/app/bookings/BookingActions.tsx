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
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    })
     if(res.ok) {
      window.location.reload()
     } else {
      const data = await res.json()
      alert(data.message)
     }
  }

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button onClick={() => handleAction('approve')} className="btn-primary" style={{ padding: '8px 16px', fontSize:   '0.9rem' }}>
        Approve
      </button>
      <button onClick={() => handleAction('reject')} className="btn-danger" style={{ padding: '8px 16px', fontSize:   '0.9rem' }}>
        Reject
      </button>
    </div>
  )
}