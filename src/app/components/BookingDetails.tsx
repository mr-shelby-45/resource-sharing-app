import { countDays, calculateFee } from '@/lib/dates'
import { formatDateRange } from '@/lib/format'

type Props = {
  booking: { startDate: Date; endDate: Date; dailyRate: number; decisionNote?: string | null }
  noteBy?: string   // first name shown under a decision note
}

// Dates, the sum, and any decision note for one booking. No hooks, so it works in server components.
export default function BookingDetails({ booking, noteBy }: Props) {
  const days = countDays(booking.startDate, booking.endDate)
  const fee = calculateFee(booking.dailyRate, booking.startDate, booking.endDate)
  const dayWord = `${days} ${days === 1 ? 'day' : 'days'}`
  const sum = booking.dailyRate === 0
    ? `${dayWord}, free`
    : `${dayWord} x KES ${booking.dailyRate.toLocaleString('en-KE')} = KES ${fee.toLocaleString('en-KE')}`
  return (
    <div className="booking-details">
      <p>{formatDateRange(booking.startDate, booking.endDate)}</p>
      <p>{sum}</p>
      {booking.decisionNote && (
        <blockquote className="quote">
          {booking.decisionNote}
          {noteBy && <cite>{noteBy}</cite>}
        </blockquote>
      )}
    </div>
  )
}
