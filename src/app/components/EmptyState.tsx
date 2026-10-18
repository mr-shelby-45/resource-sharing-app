// the "nothing here yet" block; children is an optional button or link
export default function EmptyState({ message, children }: { message: string; children?: React.ReactNode }) {
  return (
    <div className="empty">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M3 8l9-5 9 5v8l-9 5-9-5V8z" /><path d="M3 8l9 5 9-5M12 13v8" />
      </svg>
      <p>{message}</p>
      {children}
    </div>
  )
}
