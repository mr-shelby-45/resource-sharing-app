'use client'
import { useState } from 'react'
import Image from 'next/image'

// Big photo with a row of thumbnails. Clicking a thumbnail swaps the big photo.
export default function ItemGallery({ urls, title }: { urls: string[]; title: string }) {
  const [active, setActive] = useState(0)
  if (urls.length === 0) return null

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', borderRadius: '8px', overflow: 'hidden', background: 'var(--surface-2)' }}>
        <Image src={urls[active]} alt={`${title}, photo ${active + 1} of ${urls.length}`}
          fill sizes="(max-width: 640px) 100vw, 600px" style={{ objectFit: 'cover' }} priority />
      </div>
      {urls.length > 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '8px' }}>
          {urls.map((url, i) => (
            <button key={url} type="button" onClick={() => setActive(i)} aria-label={`Show photo ${i + 1}`}
              style={{
                position: 'relative', aspectRatio: '1', padding: 0, overflow: 'hidden', borderRadius: '8px',
                border: i === active ? '2px solid var(--primary)' : '2px solid transparent',
              }}>
              <Image src={url} alt="" fill sizes="150px" style={{ objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}