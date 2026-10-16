import Link from 'next/link'
import Thumb from './Thumb'

// The signature layout: a ledger row. Title and metadata on the left, status or one action on the right.

type ExpandProps = {
  title: string
  meta: React.ReactNode      // owner or borrower name, dates
  status: React.ReactNode    // a StatusPill
  children: React.ReactNode  // opens in place: details and actions
}

// Opens in place. <details> is a real disclosure: keyboard operable, announced with its expanded state,
// and it needs no JavaScript.
export function ExpandRow({ title, meta, status, children }: ExpandProps) {
  return (
    <li>
      <details>
        <summary className="row-sum">
          <span>
            <span className="row-title" style={{ display: 'block' }}>{title}</span>
            <span className="row-meta" style={{ display: 'block' }}>{meta}</span>
          </span>
          <span className="row-side">{status}</span>
        </summary>
        <div className="row-body">{children}</div>
      </details>
    </li>
  )
}

type LinkProps = {
  href: string
  title: string
  description: string
  imageUrl?: string
  meta: React.ReactNode
}

// A whole row that opens the item.
export function LinkRow({ href, title, description, imageUrl, meta }: LinkProps) {
  return (
    <li>
      <Link href={href} className="row-link">
        <Thumb url={imageUrl} title={title} />
        <span style={{ minWidth: 0 }}>
          <span className="row-title" style={{ display: 'block' }}>{title}</span>
          <span className="row-meta row-desc" style={{ display: 'block' }}>{description}</span>
          <span className="row-meta">{meta}</span>
        </span>
      </Link>
    </li>
  )
}
