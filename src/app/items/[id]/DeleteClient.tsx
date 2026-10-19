'use client'
import { handleDelete } from "./DeleteButton";
import { useFeedback } from "@/app/components/Feedback";

export default function DeleteButtonClient({ itemId, title }: { itemId: number; title?: string }) {
  const { confirm, toast } = useFeedback();

  async function onClick() {
    const ok = await confirm({
      title: title ? `Remove ${title}?` : 'Remove this item?',
      body: 'It will disappear from the community. Past bookings keep their history.',
      confirmLabel: 'Remove',
      danger: true,
    });
    if (!ok) return;
    const result = await handleDelete(itemId);
    if (result?.error) toast(result.error, 'error');
  }

  return <button type="button" onClick={onClick} className="btn-text btn-text-danger">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>
      Remove
    </button>;
}
