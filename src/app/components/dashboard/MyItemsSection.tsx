import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { todayInNairobi } from '@/lib/dates'
import { isOverdue } from '@/lib/bookingTasks'
import Section from '../Section'
import EmptyState from '../EmptyState'
import ItemCard from '../ItemCard'
import DeleteButtonClient from '../../items/[id]/DeleteClient'

// the owner's own items, each flagged with where it is: out with someone, overdue, booked ahead, or free
export default async function MyItemsSection({ userId }: { userId: number }) {
  const today = todayInNairobi()
  const items = await prisma.item.findMany({
    where: { ownerId: userId, deletedAt: null },
    include: {
      // approved and not yet returned
      bookings: { where: { status: 'APPROVED' }, include: { borrower: { select: { name: true } } } },
      images: { orderBy: { position: 'asc' }, take: 1 },
    },
  })

  function flag(item: (typeof items)[number]) {
    const overdue = item.bookings.find(b => isOverdue(b, today))
    if (overdue) return { tone: 'booked' as const, label: `Overdue: ${overdue.borrower.name}` }
    const out = item.bookings.find(b => b.startDate <= today && b.endDate >= today)
    if (out) return { tone: 'booked' as const, label: `Out with ${out.borrower.name}` }
    if (item.bookings.length > 0) return { tone: 'pending' as const, label: 'Booked ahead' }
    return { tone: 'available' as const, label: 'Available' }
  }

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
          <div className="tile-grid">
            {items.map(item => (
              <ItemCard key={item.id} item={item} href={`/items/${item.id}`} badge={flag(item)}>
                <DeleteButtonClient itemId={item.id} title={item.title} />
              </ItemCard>
            ))}
          </div>
        )}
    </Section>
  )
}
