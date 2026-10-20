//one endpoint, four actions on a booking: approve, reject (owner), return (owner), cancel (borrower)
import { approveBooking, returnItem, cancelBooking } from '@/services/bookingServices'
import { retryPayout } from '@/services/paymentServices'
import { withAuth } from '@/lib/apiHandler'
import { readJson } from '@/lib/apiHandler'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, currentUser) => {
    const { id } = await params //from the url
    const bookingId = Number(id)
    if(!Number.isInteger(bookingId)) {
      return Response.json({ message: "Invalid booking id" }, { status: 400 })
    }
    const { action } = await readJson<{ action: string }>(req) //from the body

    switch(action) {
      case "approve":
      case "reject":
        return Response.json(await approveBooking(currentUser, bookingId, action), { status: 200 })
      case "return":
        return Response.json(await returnItem(currentUser, bookingId), { status: 200 })
      case "cancel":
        return Response.json(await cancelBooking(currentUser, bookingId), { status: 200 })
      case "retry_payout":
        return Response.json(await retryPayout(currentUser, bookingId), { status: 200 })
      default:
        return Response.json({ message: "Invalid action" }, { status: 400 })
    }
  })
}