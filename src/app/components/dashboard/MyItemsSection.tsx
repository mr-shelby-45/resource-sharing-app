import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { todayInNairobi } from '@/lib/dates'
import Section from '../Section'
import EmptyState from '../EmptyState'
import ItemCard from '../ItemCard'
import DeleteButtonClient from '../../items/[id]/DeleteClient'

// the owner's own items, each marked Booked while an approved booking is still running
export default async function MyItemsSection({ userId }: { userId: number }) {
  const items = await prisma.item.findMany({
    where: { ownerId: userId, deletedAt: null },
    include: {
      bookings: { where: { status: 'APPROVED', endDate: { gte: todayInNairobi() } } },
      images: { orderBy: { position: 'asc' }, take: 1 },
    },
  })

  return (
    <Section title="Your Items"
      action={<Link href="/items/new" className="btn btn-primary btn-sm">Add item</Link>}>
      {items.length === 0
        ? (
          <EmptyState message="No items listed yet">
            <Link href="/items/new" className="btn btn-primary">Add your first item</Link>
          </EmptyState>
        )
        : (
          <div className="card-grid">
            {items.map(item => {
              const isBooked = item.bookings.length > 0
              return (
                <ItemCard key={item.id} item={item}
                  badge={{ tone: isBooked ? 'booked' : 'available', label: isBooked ? 'Booked' : 'Available' }}>
                  <DeleteButtonClient itemId={item.id} />
                </ItemCard>
              )
            })}
          </div>
        )}
    </Section>
  )
}
