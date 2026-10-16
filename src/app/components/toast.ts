// Shows a short message in the Toaster mounted in the root layout. Client side only.
export function showToast(message: string) {
  window.dispatchEvent(new CustomEvent('jirani:toast', { detail: message }))
}
