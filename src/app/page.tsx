import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import BookingActions from './bookings/BookingActions'
import BookingButton from './items/[id]/BookingButton'
import DeleteButtonClient from './items/[id]/DeleteClient'

export default async function HomePage() {
  //cookies are not manually forwarded.
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if(!token) redirect('/login')
  
  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: number, role: string }
    //confirm if the user exists in the database with the decoded userId from the cookie
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
    if(!user) redirect('/login')

    if(!user.canBorrow && !user.canList) {
      return(
        <div className='page'>
          <div>
            <h1>Hey, {user.name}</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px'}}> You have been banned from this website </p>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px'}}> Contact admin </p>
          </div>
        </div>
      )
    }
    
    if(user.canList) {
      //get all the items with the associated confirmed userId & whose booking status is approved
      const items = await prisma.item.findMany({
        where: { ownerId: decoded.userId },
        include: {
          bookings: { where: { status: "APPROVED" } }
        }
      })
      //get all booked items, waiting for approval or rejection
      const bookedItems = await prisma.booking.findMany({
        where: {
          status: 'PENDING',
          item: { ownerId: decoded.userId }
        },
        include: { item: true, borrower: true }
      })
      //owner's can now book
      const bookings = await prisma.booking.findMany({
        where: { borrowerId: decoded.userId },
        include: { item: true }
      })

      const itemsToBook = await prisma.item.findMany({
        where: {
          NOT: { ownerId: decoded.userId },
          bookings: { none: { status: "APPROVED" } }
        }
      })
      //owners
      //ternary operator to check if the returned array from the db is null or there are react elements to render
      //{/*add a new item if there are no items yet*/}
      //displays all items their own showing if the item is booked or otherwise
      return (
        <div className="page">
          <div style={{ marginBottom: '32px' }}>
            <h1>Welcome back, {user.name}</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>
              Manage your items and booking requests
            </p>
            <a href="/items" style={{ 
              display: 'inline-block',
              marginTop: '12px',
              color: 'var(--primary)',
              fontWeight: '500',
              fontSize: '0.95rem'
            }}>
              Browse all community items →
            </a>
          </div>
            {/**items that you own */}
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
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.description}
                        </p>
                        <DeleteButtonClient itemId={item.id}/>
                      </div>
                    )
                  })}
                </div>
              )
            }
          </section>
            {/*display all the pending requests and the borrower's details */}
          <section style={{ marginBottom: '48px'}}>
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
          {/**to display the items that are pending for approval */}
          <section style={{ marginBottom: '48px'}}>
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
                      <div key={booking.id} className="card" style={{ display: 'flex', justifyContent: 'space-between',               alignItems: 'center' }}>
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
          {/*for user.canList to book items that are available*/}
          <section style={{ marginBottom: '48px' }}>
            <h2 style={{ marginBottom: '20px' }}>Available Items</h2>
            {itemsToBook.length === 0
              ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <p>No items available right now. Check back soon.</p>
                </div>
              )
              : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {itemsToBook.map(item => (
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
        </div>
       )
    }

    if(user.canBorrow) {
      //gets all the available items, by filtering items whose status is 'approved'
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
            <a href="/items" style={{ 
              display: 'inline-block',
              marginTop: '12px',
              color: 'var(--primary)',
              fontWeight: '500',
              fontSize: '0.95rem'
            }}>
              Browse all community items →
            </a>
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
                    <div key={booking.id} className="card" style={{ display: 'flex', justifyContent:'space-between',alignItems:'center' }}>
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