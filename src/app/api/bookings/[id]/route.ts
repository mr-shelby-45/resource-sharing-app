//find booking by id,change status to approved,set item.available to FALSE, Reject other bookings for the same item by owner
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { approveBooking } from '@/services/bookingServices'
/*
type Props = {
  params: { id: string }
}*/
//nextjs 15 params are now a promise that you need to await
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // or : Props
) {
  try {
    //requireAuth returns a userId on success/ error and status on failure
    const auth = requireAuth(request)
    if('error' in auth) {
      return Response.json (
        { message: auth.error},
        { status: auth.status} 
      )
    }
    //get the user by their userID 
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId}
    })
    //handles null
    if(!currentUser) {
      return Response.json(
        { message: 'user not found' },
        { status: 404 }
      )
    }
    const { id } = await params
    const bookingId = Number(id)
    const body = await request.json() as { action: string }
    const { action } = body

    const booked = await approveBooking(currentUser, bookingId, action)
    return Response.json( booked, { status: 201})

  } catch(error: any) {
    console.error("Booking error:", error)
    return Response.json(
      { message: error.message || "An unexpected error occurred"},
      { status: 500 }
    )
  }
}