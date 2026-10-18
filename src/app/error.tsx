'use client'

// shown when a page fails while loading (for example the database is unreachable)
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page">
      <div className="empty">
        <h2>Something went wrong</h2>
        <p>The page could not load. Please try again.</p>
        <button className="btn btn-primary" onClick={reset}>Try again</button>
      </div>
    </div>
  )
}
