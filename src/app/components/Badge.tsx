export type Tone = 'available' | 'booked' | 'pending' | 'approved' | 'rejected' | 'returned' | 'cancelled'

// one small coloured label; the colours live in globals.css (.badge-<tone>)
export default function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

// for a booking status straight from the database, e.g. "PENDING" -> "Pending"
export function StatusBadge({ status }: { status: string }) {
  const tone = status.toLowerCase() as Tone
  return <Badge tone={tone}>{tone.charAt(0).toUpperCase() + tone.slice(1)}</Badge>
}
