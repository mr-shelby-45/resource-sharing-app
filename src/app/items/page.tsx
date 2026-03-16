import { prisma } from "@/lib/prisma"
//server component gets all the items for listing from across the platform and reduces the js bundle from the client component to the browser
export default async function ItemsPage() {
  const items = await prisma.item.findMany({
    //gets all the items with status as approved only
    include: {
      bookings: {
        where: { status: 'APPROVED' }
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
      {/*ternary operator checking if the array of react elements is empty to render a different msg*/}
      {items.length === 0
        ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <p>No items available right now. Check back soon.</p>
          </div>
        )
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {/*.map converts the array of item objects to array of reacts elements that can be rendered */}
            {items.map(item => {
              const isAvailable = item.bookings.length === 0
              return (
                <div key={item.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3>{item.title}</h3>
                    <span className={`badge ${isAvailable ? 'badge-available' : 'badge-booked'}`}>
                      {isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                    {item.description}
                  </p>
                  {isAvailable
                    ? <button className="btn-accent" style={{ width: '100%', padding: '10px' }}>Request Booking</button>
                    : <button disabled style={{ width: '100%', padding: '10px', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--radius)', border: 'none', cursor: 'not-allowed' }}>Unavailable</button>
                  }
                </div>
              )
            })}
          </div>
        )
      }
    </div>
  )
}