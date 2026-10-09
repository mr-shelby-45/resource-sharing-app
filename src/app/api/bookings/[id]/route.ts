//find booking by id,change status to approved,set item.available to FALSE, Reject other bookings for the same item by owner

import { approveBooking } from '@/services/bookingServices'
import { withAuth } from '@/lib/apiHandler'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // or : Props
) {
  return withAuth(request, async (req, currentUser)=> { 
    const { id } = await params //from the url
    console.log(typeof(id))
    const { action } = await req.json() as { action: string } //action from the body
    //validate only the eligibe actions 
    const validActions = ["accept", "reject"]
    if(!action || !validActions.includes(action)) {
      return Response.json({ message: "InvalidActions" }, { status: 400 })
    }
    const booked = await approveBooking(currentUser, Number(id), action)
    return Response.json(booked, { status: 200 })
  }) 
}