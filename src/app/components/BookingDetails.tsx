import { countDays, calculateFee } from '@/lib/dates'
import { formatDateRange } from '@/lib/format'

type Props = {
  booking: { startDate: Date; endDate: Date; dailyRate: number; decisionNote?: string | null }
}

// Dates, number of days and fee for one booking. No hooks, so it works in server components.
export default function BookingDetails({ booking }: Props) {
  const days = countDays(booking.startDate, booking.endDate)
  const fee = calculateFee(booking.dailyRate, booking.startDate, booking.endDate)
  return (
    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>
      <p>{formatDateRange(booking.startDate, booking.endDate)} ({days} {days === 1 ? 'day' : 'days'})</p>
      <p style={{ fontWeight: 500 }}>
        {fee === 0 ? 'Free' : `Fee: KES ${fee.toLocaleString('en-KE')}`}
      </p>
      {booking.decisionNote && <p style={{ fontStyle: 'italic' }}>{booking.decisionNote}</p>}
    </div>
  )
}