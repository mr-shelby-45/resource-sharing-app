//client component for the booking button

'use client'

type Props = {
  itemId: number
}

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
    <button onClick={handleBooking}>Request Booking</button>
  )
}