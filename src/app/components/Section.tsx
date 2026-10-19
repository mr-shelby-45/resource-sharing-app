// A titled block of a page. `action` is an optional link or button at the far right of the title row,
// `count` a small number after the title, `narrow` keeps list sections to a readable width.
export default function Section({ title, count, action, narrow, children }: {
  title: string
  count?: number
  action?: React.ReactNode
  narrow?: boolean
  children: React.ReactNode
}) {
  return (
    <section className="section">
      <div className={narrow ? 'narrow' : undefined}>
        <div className="section-head">
          <h2>{title}{count !== undefined && <span className="section-count">{count}</span>}</h2>
          {action}
        </div>
        {children}
      </div>
    </section>
  )
}
