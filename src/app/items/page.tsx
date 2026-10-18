import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { todayInNairobi } from '@/lib/dates'
import { getCurrentUser } from '@/lib/currentUser'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import ItemCard from '../components/ItemCard'

//server component: lists every item in the community
export default async function ItemsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const items = await prisma.item.findMany({
    where: { deletedAt: null },
    include: {
      images: { orderBy: { position: 'asc' }, take: 1 },
      // approved bookings that have not finished, so a card can say "Booked on some dates"
      bookings: { where: { status: 'APPROVED', endDate: { gte: todayInNairobi() } } },
    },
  })

  return (
    <div className="page">
      <PageHeader title="Browse Items" subtitle="Items available for borrowing in your community" />
      {items.length === 0
        ? <EmptyState message="No items available right now. Check back soon." />
        : (
          <div className="tile-grid">
            {items.map(item => {
              const hasBookings = item.bookings.length > 0
              return (
                <ItemCard key={item.id} item={item} href={`/items/${item.id}`}
                  badge={{ tone: hasBookings ? 'pending' : 'available', label: hasBookings ? 'Taken on some dates' : 'Available' }}>
                  {item.ownerId === user.id && <p className="muted text-sm">Your item</p>}
                </ItemCard>
              )
            })}
          </div>
        )}
    </div>
  )
}
