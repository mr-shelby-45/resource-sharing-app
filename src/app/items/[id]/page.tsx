import { items } from '@/app/api/data'
import BookingButton from './BookingButton'

type Props = {
  params: { id: string }
}

export default function ItemDetailPage ({ params }: Props) {
  const id = Number(params.id)
  const item = items.find(i => i.id === id)

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