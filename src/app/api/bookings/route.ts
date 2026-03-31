import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createBooking } from '@/services/bookingServices';


export async function POST(request: Request) {
  try {
    //1. authenticate from auth.ts
    const auth = requireAuth(request)
    if('error' in auth) {
      // (Response.json)It reads the response body from a network   request and converts the raw JSON text into a usable native   object 
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
    //2. check if they are eligible to borrow
    if(!currentUser.canBorrow) {
      return Response.json (
        { message: 'Forbidden' },
        { status: 403 }
      )
    }
    //3. parse body -> take the raw data from an HTTP request like  POST, GET and convert it to a useable object.
    const body: { itemId: number} = await request.json()
    //finds item in items and compares to body.item to check its  availability

    const item = await prisma.item.findUnique({
      where: { id: body.itemId }
    })

    if(!item) {
      return Response.json(
        { message: 'Item not found' }, 
        {status: 404}
      )
    }
    const newBooking = await createBooking(currentUser, item)
    return Response.json(newBooking, { status: 201 })

  } catch(error: any){
    console.error("Booking error:", error)
    return Response.json(
      { message: error.message || "An unexpected error occurred"},
      { status: 500 }
    )
  }
  
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