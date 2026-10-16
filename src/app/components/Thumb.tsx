import Image from 'next/image'

// 56px thumbnail for list rows. Items without a photo get a monogram, so rows stay aligned
// and nothing is fetched from an external placeholder service.
export default function Thumb({ url, title }: { url?: string; title: string }) {
  return (
    <span className="thumb" aria-hidden="true">
      {url
        ? <Image src={url} alt="" fill sizes="56px" style={{ objectFit: 'cover' }} />
        : title.trim().charAt(0).toUpperCase()}
    </span>
  )
}
