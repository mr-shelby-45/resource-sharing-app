//item detail: shows the item, the dates already taken, and a booking form for those allowed to borrow
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
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
      <div className="page" style={{ textAlign: 'center', paddingTop: '80px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Item not found</p>
        <a href="/" style={{ color: 'var(--primary)', fontWeight: '500', marginTop: '16px', display: 'inline-block' }}>
          Back to dashboard
        </a>
      </div>
    )
  }

  const isOwner = item.ownerId === user.id
  const canRequest = !isOwner && (user.canBorrow || user.isAdmin)
  const bookedRanges = item.bookings.map(b => ({ start: iso(b.startDate), end: iso(b.endDate) }))

  return (
    <div className="page" style={{ maxWidth: '600px' }}>
      <a href="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'inline-block', marginBottom: '24px' }}>
        ← Back
      </a>
      <div className="card">
        <ItemGallery urls={item.images.map(i => i.url)} title={item.title} />
        <h1 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>{item.title}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.7' }}>{item.description}</p>
        <p style={{ fontWeight: '600', color: 'var(--primary)', marginBottom: '16px' }}>{formatRate(item.dailyRate)}</p>

        {item.bookings.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontWeight: 500, marginBottom: '8px' }}>Already booked</p>
            <ul style={{ color: 'var(--text-muted)', paddingLeft: '18px' }}>
              {item.bookings.map(b => <li key={b.id}>{formatDateRange(b.startDate, b.endDate)}</li>)}
            </ul>
          </div>
        )}

        {isOwner
          ? <p style={{ color: 'var(--text-muted)' }}>This is your item.</p>
          : !canRequest
            ? <p style={{ color: 'var(--text-muted)' }}>Your account is not allowed to borrow.</p>
            : <BookingForm itemId={item.id} dailyRate={item.dailyRate} minDate={iso(today)} bookedRanges={bookedRanges} />}
      </div>
    </div>
  )
}