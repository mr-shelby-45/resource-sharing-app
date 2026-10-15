'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  itemId: number
  dailyRate: number
  minDate: string                                    // today, "YYYY-MM-DD"
  bookedRanges: { start: string; end: string }[]     // approved bookings
}

const DAY_MS = 24 * 60 * 60 * 1000

export default function BookingForm({ itemId, dailyRate, minDate, bookedRanges }: Props) {
  const router = useRouter()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const ready = startDate !== '' && endDate !== '' && endDate >= startDate
  // "YYYY-MM-DD" strings compare correctly as text, and parse as UTC midnight
  const days = ready
    ? Math.round((Date.parse(endDate) - Date.parse(startDate)) / DAY_MS) + 1
    : 0
  const clash = ready && bookedRanges.some(r => startDate <= r.end && r.start <= endDate)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, startDate, endDate }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.message ?? 'Something went wrong')
      } else {
        setDone(true)
        router.refresh()
      }
    } catch {
      setError('Network error, please try again')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return <p style={{ color: 'var(--primary)', fontWeight: 500 }}>
      Request sent. The owner will review it.
    </p>
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
      <label>
        From
        <input type="date" required min={minDate} value={startDate}
          onChange={e => {
            setStartDate(e.target.value)
            if (endDate && endDate < e.target.value) setEndDate('')
          }} />
      </label>
      <label>
        To
        <input type="date" required min={startDate || minDate} value={endDate}
          onChange={e => setEndDate(e.target.value)} />
      </label>

      {ready && (
        <p style={{ color: 'var(--text-muted)' }}>
          {days} {days === 1 ? 'day' : 'days'} × {dailyRate === 0 ? 'Free' : `KES ${dailyRate.toLocaleString('en-KE')}`}
          {dailyRate > 0 && <strong> = KES {(days * dailyRate).toLocaleString('en-KE')}</strong>}
        </p>
      )}
      {clash && (
        <p style={{ color: 'var(--danger, #b00020)' }}>
          These dates overlap an approved booking. Pick different dates.
        </p>
      )}
      {error && <p style={{ color: 'var(--danger, #b00020)' }}>{error}</p>}

      <button type="submit" className="btn-primary" disabled={!ready || clash || loading}>
        {loading ? 'Sending…' : 'Request to borrow'}
      </button>
    </form>
  )
}