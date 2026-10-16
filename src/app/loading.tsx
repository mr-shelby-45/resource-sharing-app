// Shown while a page loads: tonal rows in the shape of a list, no spinner.
export default function Loading() {
  const row = { height: 'var(--space-7)' }
  return (
    <div className="wrap" aria-busy="true" aria-label="Loading">
      <div className="skel" style={{ height: 'var(--space-6)', width: '45%' }} />
      <div className="skel" style={{ height: 'var(--space-4)', width: '30%', marginTop: 'var(--space-3)' }} />
      <div style={{ marginTop: 'var(--space-7)', display: 'grid', gap: 'var(--space-3)' }}>
        <div className="skel" style={row} />
        <div className="skel" style={row} />
        <div className="skel" style={row} />
      </div>
    </div>
  )
}
