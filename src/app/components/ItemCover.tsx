import Image from 'next/image'

// Cover photo for item tiles. Items without photos get a quiet placeholder so tiles stay the same size.
export default function ItemCover({ url, title }: { url?: string; title: string }) {
  return (
    <div className="item-cover">
      {url
        ? <Image src={url} alt={title} fill sizes="(max-width: 560px) 50vw, 240px" />
        : (
          <span className="item-cover-empty" role="img" aria-label={`${title}, no photo`}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="M21 17l-5-5-9 7" />
            </svg>
            No photo
          </span>
        )}
    </div>
  )
}
