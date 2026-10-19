import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Section from '../Section'
import EmptyState from '../EmptyState'
import ItemCard from '../ItemCard'

// everyone else's items, each linking to the page where dates are picked
export default async function AvailableItemsSection({ userId }: { userId: number }) {
  const items = await prisma.item.findMany({
    where: { NOT: { ownerId: userId }, deletedAt: null },
    include: { images: { orderBy: { position: 'asc' }, take: 1 } },
  })

  return (
    <Section title="Available items" action={<Link href="/items" className="section-link-inline">Browse all</Link>}>
      {items.length === 0
        ? <EmptyState message="No items available right now. Check back soon." />
        : (
          <div className="tile-grid tile-grid-3">
            {items.map(item => (
              <ItemCard key={item.id} item={item} href={`/items/${item.id}`} badge={{ tone: 'available', label: 'Available' }}>
                <Link href={`/items/${item.id}`} className="btn btn-outline btn-sm btn-block">View and request</Link>
              </ItemCard>
            ))}
          </div>
        )}
    </Section>
  )
}
