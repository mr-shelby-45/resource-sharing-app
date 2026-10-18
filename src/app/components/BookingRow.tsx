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
  details?: React.ReactNode   // extra block under the row, e.g. the borrower's contact
  actions?: React.ReactNode   // buttons
}

// one booking as a hairline list row, used on Home and the Requests page
export default function BookingRow({ booking, subtitle, details, actions }: Props) {
  const { item } = booking
  return (
    <article className="row-item stack">
      <div className="row-between">
        <div>
          <h3 className="row-title">
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
