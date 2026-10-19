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
  subtitle?: string           // e.g. "Grace asked to borrow this"
  subtitleTone?: 'danger'     // red line, e.g. an overdue return
  hideStatus?: boolean        // leave the status badge out
  aside?: React.ReactNode     // buttons shown to the right of the row on wide screens
  details?: React.ReactNode   // extra block under the row, e.g. the borrower's contact
  actions?: React.ReactNode   // buttons
}

// one booking as a hairline list row, used on Home and the Requests page
export default function BookingRow({ booking, subtitle, subtitleTone, hideStatus, aside, details, actions }: Props) {
  const { item } = booking
  return (
    <article className="row-item stack">
      <div className="row-between">
        <div className="row-main">
          <h3 className="row-title">
            {item.deletedAt
              ? <>{item.title} <span className="muted text-sm">(removed)</span></>
              : <Link href={`/items/${item.id}`}>{item.title}</Link>}
          </h3>
          {subtitle && <p className={`text-sm ${subtitleTone === 'danger' ? 'overdue-line' : 'muted'}`}>{subtitle}</p>}
          <BookingDetails booking={booking} />
        </div>
        {!hideStatus && <StatusBadge status={booking.status} />}
        {aside && <div className="row-aside">{aside}</div>}
      </div>
      {details}
      {actions}
    </article>
  )
}
