import Image from 'next/image'

// Cover photo for item cards. Renders nothing when the item has no photos.
export default function ItemCover({ url, title }: { url?: string; title: string }) {
  if (!url) return null
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', background: 'var(--surface-2)' }}>
      <Image src={url} alt={title} fill sizes="(max-width: 600px) 100vw, 300px" style={{ objectFit: 'cover' }} />
    </div>
  )
}