'use client' // This allows us to use browser features like alert
import { handleDelete } from "./DeleteButton";

export default function DeleteButtonClient({ itemId }: { itemId: number }) {
  const clientAction = async () => {
    // 1. Show a confirmation alert before even trying to delete
    const confirmed = confirm("Are you sure you want to remove this item?");
    if (!confirmed) return;

    // 2. Call your server function
    const result = await handleDelete(itemId);

    // 3. If the server returns an error object, alert the user
    if (result?.error) {
      alert(result.error);
    }
  };

  return (
    <form action={clientAction}>
      <button type="submit" className="btn-danger" style={{ marginTop: '8px', width: '100%', padding: '8px' }}>
        Remove Item
      </button>
    </form>
  );
}
