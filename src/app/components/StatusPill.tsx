type Status = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'CANCELLED'

type Props = {
  status: Status
  as: 'owner' | 'borrower'   // whose point of view the wording takes
  name?: string              // the other person's first name, for "Waiting for ..."
}

const LABELS = { REJECTED: 'Declined', RETURNED: 'Returned', CANCELLED: 'Cancelled' } as const

// Status is always a word, never colour alone. Pending is the only attention colour.
export default function StatusPill({ status, as, name }: Props) {
  if (status === 'PENDING') {
    return (
      <span className="pill pill-pending">
        {as === 'owner' ? 'Needs your decision' : `Waiting for ${name ?? 'the owner'}`}
      </span>
    )
  }
  if (status === 'APPROVED') {
    return (
      <span className="pill pill-approved">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        Approved
      </span>
    )
  }
  return <span className="pill">{LABELS[status]}</span>
}
