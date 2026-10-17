// the "nothing here yet" card; children is an optional button or link
export default function EmptyState({ message, children }: { message: string; children?: React.ReactNode }) {
  return (
    <div className="card empty">
      <p>{message}</p>
      {children}
    </div>
  )
}
