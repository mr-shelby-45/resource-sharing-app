import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verify } from 'jsonwebtoken'
import { formatRate } from "@/lib/format"
import Link from "next/link"
import { todayInNairobi } from "@/lib/dates"
import ItemCover from "../components/ItemCover"

//server component gets all the items for listing from across the platform and reduces the js bundle from the client component to the browser
export default async function ItemsPage() {
  const cookiesStore = await cookies()
  const token = cookiesStore.get('token')?.value
  
  if(!token) redirect('/')

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: number, role: string}
    const items = await prisma.item.findMany({
      where: { deletedAt: null },
  //gets all the items with status as approved only
    include: {
      images: { orderBy: {position: 'asc'}, take: 1},
      bookings: {
        where: { status: 'APPROVED', endDate: { gte: todayInNairobi() } }
      }
    }
    })
    return (
      <div className="page">
        <div style={{ marginBottom: '32px' }}>
          <h1>Browse Items</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>
            Items available for borrowing in your community
          </p>
        </div>
        {items.length === 0
          ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              <p>No items available right now. Check back soon.</p>
            </div>
          )
          : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {items.map(item => {
                const hasBookings = item.bookings.length > 0
                const isOwner = item.ownerId === decoded.userId
                return (
                  <div key={item.id} className="card">
                    <ItemCover url={item.images[0]?.url} title={item.title} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <h3>{item.title}</h3>
                      <span className={`badge ${hasBookings ? 'badge-booked' : 'badge-available'}`}>
                        {hasBookings ? 'Booked on some dates' : 'Available'}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                      {item.description}
                    </p>
                    <p style={{ fontWeight: '600', color: 'var(--primary)', marginBottom: '16px' }}>
                      {formatRate(item.dailyRate)}
                    </p>
                    {isOwner
                      ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Your item</p>
                      : <Link href={`/items/${item.id}`} className="btn-accent"
                          style={{ display: 'block', textAlign: 'center' }}>
                          View and request
                        </Link>}
                  </div>
                )
              })}
            </div>
          )
        }
      </div>
    )
  } catch {
    redirect('/')
  }

}