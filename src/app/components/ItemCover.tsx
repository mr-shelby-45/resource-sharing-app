import Image from 'next/image'

// Cover photo for item cards. Renders nothing when the item has no photos.
export default function ItemCover({ url, title }: { url?: string; title: string }) {
  if (!url) return null
  return (
    <div className="item-cover">
      <Image src={url} alt={title} fill sizes="(max-width: 560px) 100vw, 320px" />
    </div>
  )
}
