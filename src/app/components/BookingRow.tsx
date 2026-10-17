import Link from 'next/link'
import { StatusBadge } from './Badge'
import BookingDetails from './BookingDetails'

type Props = {
  booking: {
    status: string
    startDate: Date
    endDate: Date
    dailyRate: number
    decisionNote?: string | null
    item: { id: number; title: string; deletedAt: Date | null }
  }
  subtitle?: string           // e.g. "Requested by Mac" or the item description
  details?: React.ReactNode   // extra block under the row, e.g. the borrower's contact panel
  actions?: React.ReactNode   // buttons
}

// the one booking card used on the dashboard and the bookings page
export default function BookingRow({ booking, subtitle, details, actions }: Props) {
  const { item } = booking
  return (
    <article className="card stack">
      <div className="row-between">
        <div>
          <h3>
            {item.deletedAt
              ? <>{item.title} <span className="muted text-sm">(removed)</span></>
              : <Link href={`/items/${item.id}`}>{item.title}</Link>}
          </h3>
          {subtitle && <p className="muted text-sm">{subtitle}</p>}
          <BookingDetails booking={booking} />
        </div>
        <StatusBadge status={booking.status} />
      </div>
      {details}
      {actions}
    </article>
  )
}
