//find an item by id, receives the item's id from the URL via params, displays details of the item and a button to book iff the item is available 
import { prisma } from '@/lib/prisma'
import BookingButton from './BookingButton'

export default async function ItemDetailPage ({ params }: { params: Promise<{id: string }> }) {
  const { id: rawId } = await params
  const id = Number(rawId)
  const item = await prisma.item.findUnique({
    where: { id }
  })

  if(!item) {
    return <div>Item not found</div>
  }
  return(
    <div>
      <h1>{item.title}</h1>
      <p>{item.description}</p>
      <p>Status: {item.available ? 'Available' : 'Not available'}</p>

      { item.available && <BookingButton itemId={item.id} />}
    </div>
  )
}