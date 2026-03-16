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
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: '80px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Item not found</p>
        <a href="/" style={{ color: 'var(--primary)', fontWeight: '500', marginTop: '16px', display: 'inline-block' }}>
          Back to dashboard
        </a>
      </div>
    )
  }
  // item.bookings only contains APPROVED bookings (filtered in the query above)
  // if the array is empty (length === 0), no one has an approved booking → item is available
  // if the array has 1 entry, someone already has an approved booking → item is taken
  const isAvailable = item.bookings.length === 0

  return(
    <div className="page" style={{ maxWidth: '600px' }}>
      <a href="/" style={{ 
        color: 'var(--text-muted)', 
        fontSize: '0.9rem', 
        display: 'inline-block',
        marginBottom: '24px'
      }}>
        ← Back
      </a>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '1.6rem' }}>{item.title}</h1>
          <span className={`badge ${isAvailable ? 'badge-available' : 'badge-booked'}`}>
            {isAvailable ? 'Available' : 'Not available'}
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.7' }}>
          {item.description}
        </p>
        { isAvailable && <BookingButton itemId={item.id} />}
      </div>
    </div>
  )
}