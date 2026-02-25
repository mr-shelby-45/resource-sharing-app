import { requireAuth } from '@/lib/auth';
import { bookings, items } from '../data'
import { canCreateBooking } from '@/lib/permissions'
import { Booking } from '@/types'


export async function POST(request: Request) {
  //1. authenticate from auth.ts
  const auth = requireAuth(request)
  if('error' in auth) {
    // (Response.json)It reads the response body from a network request and converts the raw JSON text into a usable native object 
    return Response.json(
      { message: auth.error },
      { status: auth.status }
    )
  }

  const currentUser = auth.user
  //2. authorization(check the role of the authenticated user)
  if(currentUser.role !== 'borrower') {
    return Response.json (
      { message: 'Forbidden' },
      { status: 403 }
    )
  }
  //3. parse body -> take the raw data from an HTTP request like POST, GET and convert it to a useable object.
  const body: { itemId: number} = await request.json()
  //finds item in items and compares to body.item to check its availability
  
  const item = items.find(i => i.id === body.itemId)

  if(!item) {
    return Response.json(
      { message: 'Item not found' }, 
      {status: 404}
    )
  }
  //Authorization code below, now done by permission.ts
  const permission = canCreateBooking(currentUser, item)

  if(!permission.allowed) {
    return Response.json(
      { message: permission.message },
      { status: 403 }
    )
  }

  //declares new var (newBooking) and enforces the type Booking in types.ts newBooking: Booking enforces the contract in types.

  const newBooking: Booking = {
    id: bookings.length +1,
    itemId: body.itemId,
    borrowerId: currentUser.id,
    status: 'pending' as const
  }

  bookings.push(newBooking)

  return Response.json(newBooking, { status: 201 })
}

export async function GET() {
  return Response.json(bookings)
}