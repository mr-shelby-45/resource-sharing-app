import Link from 'next/link'
import EmptyState from './components/EmptyState'

export default function NotFound() {
  return (
    <div className="page page-narrow">
      <EmptyState message="We could not find that page.">
        <Link href="/" className="btn btn-primary">Back to Home</Link>
      </EmptyState>
    </div>
  )
}
