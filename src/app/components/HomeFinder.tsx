const CATEGORIES = ['All', 'Kitchen', 'Power tools', 'Ladders', 'Camping', 'Furniture', 'Hand tools']

// Greeting with the search box and category chips. Search and categories are placeholders for a later phase.
export default function HomeFinder({ name }: { name: string }) {
  return (
    <div className="finder">
      <h1 className="finder-title">Hi, {name}</h1>
      <div className="finder-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" />
        </svg>
        <input type="search" placeholder="Drill, ladder, tent" disabled aria-label="Search items (coming soon)" />
      </div>
      <div className="chips" aria-label="Categories (coming soon)">
        {CATEGORIES.map((c, i) => (
          <button key={c} type="button" className={`chip${i === 0 ? ' chip-active' : ''}`} disabled>{c}</button>
        ))}
      </div>
    </div>
  )
}
