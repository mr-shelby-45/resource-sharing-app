import { requireAuth } from '@/lib/auth';
import { canCreateBooking } from '@/lib/permissions'
import { prisma } from '@/lib/prisma';


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
  const user = await prisma.user.findUnique({
    where: { id: auth.userId}
  })
  
  if(!user) {
    return Response.json(
      { message: 'User not found' },
      { status: 404 }
    )
  }
  
  const currentUser = user
  //2. authorization(check the role of the authenticated user)
  if(currentUser.role !== 'BORROWER') {
    return Response.json (
      { message: 'Forbidden' },
      { status: 403 }
    )
  }
  //3. parse body -> take the raw data from an HTTP request like POST, GET and convert it to a useable object.
  const body: { itemId: number} = await request.json()
  //finds item in items and compares to body.item to check its availability
  
  const item = await prisma.item.findUnique({
    where: { id: body.itemId }
  })

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
  /*
  const newBooking: Booking = {
    id: bookings.length +1,
    itemId: body.itemId,
    borrowerId: currentUser.id,
    status: 'PENDING' as const
  }*/
 const newBooking = await prisma.booking.create({
  data: {
    itemId: body.itemId,
    borrowerId: currentUser.id,
    status: 'PENDING'
  }
 })


  return Response.json(newBooking, { status: 201 })
}
//one query returns the booking with the full item and borrower
export async function GET() {
  const bookings = await prisma.booking.findMany({
    include: {
      item: true,
      borrower: true
    }
  })
  return Response.json(bookings)
}