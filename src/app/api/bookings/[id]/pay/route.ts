// POST /api/bookings/:id/pay  ->  { url } the Paystack checkout to send the borrower to
import { withAuth } from '@/lib/apiHandler'
import { startPayment } from '@/services/paymentServices'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, currentUser) => {
    const bookingId = Number((await params).id)
    if (!Number.isInteger(bookingId)) {
      return Response.json({ message: 'Invalid booking id' }, { status: 400 })
    }
    const { url } = await startPayment(currentUser, bookingId, new URL(req.url).origin)
    return Response.json({ url }, { status: 200 })
  })
}
