//client component for the booking button

'use client'

type Props = {
  itemId: number
}
//fetches a booking by their id and request a booking , itemId gotten from the booking
export default  function BookingButton({ itemId }: Props) {
  async function handleBooking(){
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId
      })
    })
    if(res.ok) {
      alert('Booking requested successfully')
    } else {
      const data = await res.json()
      alert(data.message)
    }
  }
  return (
    <button onClick={handleBooking} className="btn-accent" style={{ width: '100%', padding: '10px' }}>
      Request Booking
    </button>
  )
  
}