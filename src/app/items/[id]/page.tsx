//item detail: shows the item, the dates already taken, and a booking form for those allowed to borrow
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EmptyState from '../../components/EmptyState'
import BookingForm from './BookingForm'
import { formatRate, formatDateRange } from '@/lib/format'
import { todayInNairobi } from '@/lib/dates'
import { getCurrentUser } from '@/lib/currentUser'
import ItemGallery from './ItemGallery'

const iso = (d: Date) => d.toISOString().slice(0, 10)

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const { id: rawId } = await params
  const id = Number(rawId)
  const today = todayInNairobi()

  const item = Number.isInteger(id)
    ? await prisma.item.findUnique({
        where: { id, deletedAt: null },
        include: {
          images: { orderBy: { position: 'asc' } },
          // only approved bookings that haven't finished block dates
          bookings: {
            where: { status: 'APPROVED', endDate: { gte: today } },
            orderBy: { startDate: 'asc' },
          },
        },
      })
    : null

  if (!item) {
    return (
      <div className="page page-narrow">
        <EmptyState message="Item not found">
          <Link href="/" className="link-strong">Back to dashboard</Link>
        </EmptyState>
      </div>
    )
  }

  const isOwner = item.ownerId === user.id
  const canRequest = !isOwner && (user.canBorrow || user.isAdmin)
  const bookedRanges = item.bookings.map(b => ({ start: iso(b.startDate), end: iso(b.endDate) }))

  return (
    <div className="page">
      <Link href="/" className="back-link">← Back</Link>
      <div className="item-layout">
        <ItemGallery urls={item.images.map(i => i.url)} title={item.title} />

        <div className="card stack item-info">
          <h1>{item.title}</h1>
          <p className="muted">{item.description}</p>
          <p className="price">{formatRate(item.dailyRate)}</p>

          {item.bookings.length > 0 && (
            <div>
              <p className="strong">Already booked</p>
              <ul className="muted booked-list">
                {item.bookings.map(b => <li key={b.id}>{formatDateRange(b.startDate, b.endDate)}</li>)}
              </ul>
            </div>
          )}

          {isOwner
            ? <p className="muted">This is your item.</p>
            : !canRequest
              ? <p className="muted">Your account is not allowed to borrow.</p>
              : <BookingForm itemId={item.id} dailyRate={item.dailyRate} minDate={iso(today)} bookedRanges={bookedRanges} />}
        </div>
      </div>
    </div>
  )
}
