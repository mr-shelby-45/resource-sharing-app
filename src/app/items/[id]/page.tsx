//find an item by id, receives the item's id from the URL via params, displays details of the item and a button to book iff the item is available 
import { prisma } from '@/lib/prisma'
import BookingButton from './BookingButton'

export default async function ItemDetailPage ({ params }: { params: Promise<{ id: string }>}) {
  //destructure id from URL via params and reassign to the variable rawId
  const { id: rawId } = await params
  const id = Number(rawId)
  //find the item by filtering item's id, also include cheking the booking status of that item and return it one variable
  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      bookings: {
        where: { status: 'APPROVED'}
      }
    }
  })
  //check for null first, code below does not run 
  if(!item) {
    return <div>Item not found</div>
  }
  // item.bookings only contains APPROVED bookings (filtered in the query above)
  // if the array is empty (length === 0), no one has an approved booking → item is available
  // if the array has 1 entry, someone already has an approved booking → item is taken
  const isAvailable = item.bookings.length === 0
  return(
    <div>
      <h1>{item.title}</h1>
      <p>{item.description}</p>
      <p>Status: {isAvailable ? 'Available' : 'Not available'}</p>

      { isAvailable && <BookingButton itemId={item.id} />}
    </div>
  )
}