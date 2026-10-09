import { prisma } from '@/lib/prisma';
import { createBooking } from '@/services/bookingServices';
import { handleError, withAuth } from '@/lib/apiHandler';

export async function POST(request: Request) {
  return withAuth(request, async(req, currentUser) => {
    //destructure item from raw json data
    const { item } = await req.json()
    const newBooking = await createBooking(currentUser, item)
    return Response.json(newBooking, { status: 201 })
  })
}
//GET all bookings associated with the logged in user
export async function GET(request: Request) {
  return withAuth(request, async (req, currentUser) => {
    const bookings = await prisma.booking.findMany({
      where: currentUser.isAdmin
        ? {}  // admin sees all
        : {
            OR: [
              { borrowerId: currentUser.id },           // bookings they made
              { item: { ownerId: currentUser.id } }     // bookings on their items
            ]
          },
      include: {
        item: true,
        borrower: true
      }
    })
    return Response.json(bookings)
  })
}