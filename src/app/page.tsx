import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import BookingActions from './bookings/BookingActions'
import BookingButton from './items/[id]/BookingButton'

export default async function HomePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if(!token) redirect('/login')
  
  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: number, role: string }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
    if(!user) redirect('/login')
    
    if(user.role === 'OWNER') {
      const items = await prisma.item.findMany({
        where: { ownerId: decoded.userId },
        include: {
          bookings: { where: { status: "APPROVED" } }
        }
      })
      const bookedItems = await prisma.booking.findMany({
        where: {
          status: 'PENDING',
          item: { ownerId: decoded.userId }
        },
        include: { item: true, borrower: true }
      })

      return (
        <div className="page">
          <div style={{ marginBottom: '32px' }}>
            <h1>Welcome back, {user.name}</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>
              Manage your items and booking requests
            </p>
          </div>

          <section style={{ marginBottom: '48px' }}>
            <h2 style={{ marginBottom: '20px' }}>Your Items</h2>
            {items.length === 0
              ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '1.1rem', marginBottom: '16px' }}>No items listed yet</p>
                  <a href="/items/new">
                    <button className="btn-primary">Add your first item</button>
                  </a>
                </div>
              )
              : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {items.map(item => {
                    const isBooked = item.bookings.length > 0
                    return (
                      <div key={item.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <h3>{item.title}</h3>
                          <span className={`badge ${isBooked ? 'badge-booked' : 'badge-available'}`}>
                            {isBooked ? 'Booked' : 'Available'}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.description}</p>
                      </div>
                    )
                  })}
                </div>
              )
            }
          </section>

          <section>
            <h2 style={{ marginBottom: '20px' }}>Pending Requests</h2>
            {bookedItems.length === 0
              ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <p>No pending booking requests</p>
                </div>
              )
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {bookedItems.map(booking => (
                    <div key={booking.id} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                          <h3 style={{ marginBottom: '4px' }}>{booking.item.title}</h3>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{booking.item.description}</p>
                        </div>
                        <span className="badge badge-pending">Pending</span>
                      </div>
                      <div style={{ 
                        background: 'var(--surface-2)', 
                        borderRadius: '8px', 
                        padding: '12px 16px',
                        marginBottom: '16px'
                      }}>
                        <p style={{ fontWeight: '500', marginBottom: '4px' }}>{booking.borrower.name}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{booking.borrower.email}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{booking.borrower.phone}</p>
                      </div>
                      <BookingActions bookingId={booking.id} />
                    </div>
                  ))}
                </div>
              )
            }
          </section>
        </div>
      )
    }

    if(user.role === 'BORROWER') {
      const items = await prisma.item.findMany({
        where: {
          bookings: { none: { status: "APPROVED" } }
        }
      })
      const bookings = await prisma.booking.findMany({
        where: { borrowerId: decoded.userId },
        include: { item: true }
      })

      return (
        <div className="page">
          <div style={{ marginBottom: '32px' }}>
            <h1>Welcome back, {user.name}</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>
              Browse available items and track your bookings
            </p>
          </div>

          <section style={{ marginBottom: '48px' }}>
            <h2 style={{ marginBottom: '20px' }}>Available Items</h2>
            {items.length === 0
              ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <p>No items available right now. Check back soon.</p>
                </div>
              )
              : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {items.map(item => (
                    <div key={item.id} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <h3>{item.title}</h3>
                        <span className="badge badge-available">Available</span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                        {item.description}
                      </p>
                      <BookingButton itemId={item.id} />
                    </div>
                  ))}
                </div>
              )
            }
          </section>

          <section>
            <h2 style={{ marginBottom: '20px' }}>My Bookings</h2>
            {bookings.length === 0
              ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <p>No bookings yet. Request an item above.</p>
                </div>
              )
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {bookings.map(booking => (
                    <div key={booking.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontWeight: '500' }}>{booking.item.title}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{booking.item.description}</p>
                      </div>
                      <span className={`badge badge-${booking.status.toLowerCase()}`}>
                        {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )
            }
          </section>
        </div>
      )
    }
  } catch {
    redirect('/login')
  }
}