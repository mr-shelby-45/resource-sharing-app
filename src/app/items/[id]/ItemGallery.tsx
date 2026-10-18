'use client'
import { useState } from 'react'
import Image from 'next/image'

// Big photo with a row of thumbnails. Clicking a thumbnail swaps the big photo.
export default function ItemGallery({ urls, title }: { urls: string[]; title: string }) {
  const [active, setActive] = useState(0)
  if (urls.length === 0) return null

  return (
    <div>
      <div className="gallery-main">
        <Image src={urls[active]} alt={`${title}, photo ${active + 1} of ${urls.length}`}
          fill sizes="(max-width: 900px) 100vw, 720px" priority />
        {urls.length > 1 && (
          <>
            <button type="button" className="gallery-arrow gallery-prev" aria-label="Previous photo"
              onClick={() => setActive((active - 1 + urls.length) % urls.length)}>‹</button>
            <button type="button" className="gallery-arrow gallery-next" aria-label="Next photo"
              onClick={() => setActive((active + 1) % urls.length)}>›</button>
          </>
        )}
      </div>
      {urls.length > 1 && (
        <div className="gallery-thumbs">
          {urls.map((url, i) => (
            <button key={url} type="button" onClick={() => setActive(i)} aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === active} className={`gallery-thumb${i === active ? ' active' : ''}`}>
              <Image src={url} alt="" fill sizes="150px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
