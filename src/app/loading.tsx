// shown while a page loads; grey blocks in the shape of the real content
export default function Loading() {
  return (
    <div className="page" aria-busy="true" aria-label="Loading">
      <div className="skeleton" style={{ height: 36, width: 280, marginBottom: 32 }} />
      <div className="tile-grid">
        {[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ aspectRatio: '4 / 3' }} />)}
      </div>
    </div>
  )
}
