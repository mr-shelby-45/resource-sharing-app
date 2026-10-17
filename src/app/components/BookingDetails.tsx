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
    <div className="booking-details muted text-sm">
      <p>{formatDateRange(booking.startDate, booking.endDate)} ({days} {days === 1 ? 'day' : 'days'})</p>
      <p className="fee">{fee === 0 ? 'Free' : `Fee: KES ${fee.toLocaleString('en-KE')}`}</p>
      {booking.decisionNote && <p className="note">{booking.decisionNote}</p>}
    </div>
  )
}
