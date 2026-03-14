import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export default async function HomePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if(!token) redirect('/login')
  
  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: number, role: string }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId}
    })
    if(!user) redirect('/login')
    
    if(user.role === 'OWNER') {
      const items = await prisma.item.findMany({
        where: { ownerId: decoded.userId }
      })
      return(
        <div>
          <h1>Welcome {user.name}</h1>
          <h2>Your Items</h2>
          {items.length === 0
            ? <p>No items yet. Add your first item.</p>
            : items.map(item =>(
              <div key={item.id}>
                <p>{item.title}</p>
                <p>{item.description}</p>
              </div>
            ))
          }
        </div>
      )
    }
    if(user.role === 'BORROWER') {
      const items = await prisma.item.findMany({
        where: {
          bookings: {
            none: {
              status: "APPROVED"
            }
          }
        }
      })
      const bookings = await prisma.booking.findMany({
        where: { borrowerId: decoded.userId },
        include: { item: true }
      })
      return(
        <div>
          <h1>Welcome {user.name}</h1>
          <h2>All Items</h2>
          {items.length === 0
            ? <p>No items yet. Add your first item.</p>
            : items.map(item =>(
              <div key={item.id}>
                <p>{item.title}</p>
                <p>{item.description}</p>
              </div>
            ))
          }
          <h3>My Bookings</h3>
          {bookings.length === 0
            ? <p>No bookings yet. Make your first booking</p>
            : bookings.map(bookings => (
              <div key={bookings.id}>
                <p>{bookings.item.title}</p>
                <p>{bookings.status}</p>
              </div>
            ))
          
          }
        </div>
      )
    }
  } catch {
    redirect('/login')
  }

}