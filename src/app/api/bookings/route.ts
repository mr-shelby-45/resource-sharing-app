import { prisma } from '@/lib/prisma';
import { createBooking } from '@/services/bookingServices';
import { withAuth } from '@/lib/apiHandler';
import { parseDay } from '@/lib/dates';
import { readJson } from '@/lib/apiHandler';

export async function POST(request: Request) {
  return withAuth(request, async (req, currentUser) => {
    //the client sends only an id and two dates. The item, and its price, come from our database
    const { itemId, startDate, endDate } = await readJson<{ itemId: number; startDate: string; endDate: string }>(req)
    if(!Number.isInteger(itemId)) {
      return Response.json({ message: "itemId must be a whole number" }, { status: 400 })
    }
    const item = await prisma.item.findUnique({ where: { id: itemId } })
    if(!item) {
      return Response.json({ message: "Item not found" }, { status: 404 })
    }
    const newBooking = await createBooking(currentUser, item, parseDay(startDate), parseDay(endDate))
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
        //never send the whole user record: it contains the password hash
        borrower: { select: { id: true, name: true, email: true, phone: true } }
      }
    })
    return Response.json(bookings)
  })
}