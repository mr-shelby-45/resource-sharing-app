//client component for the booking button

'use client'

type Props = {
  itemId: number
}

export default  function BookingButton({ itemId }: Props) {
  async function handleBooking(){
    await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId,
        borrowerId: 2,//temp hardcoded user for illustration
      })
    })

    alert('Booking requested')

  }
  return (
    <button onClick={handleBooking}>Request Booking</button>
  )
}