import Link from 'next/link'
import Badge, { Tone } from './Badge'
import ItemCover from './ItemCover'
import { formatRate } from '@/lib/format'

type Props = {
  item: { title: string; dailyRate: number; images: { url: string }[] }
  badge?: { tone: Tone; label: string }
  href?: string                // when set, the photo and the title open this page
  children?: React.ReactNode   // a small action under the caption
}

// A photo tile with a caption, no box. Used on Home and Browse.
export default function ItemCard({ item, badge, href, children }: Props) {
  const cover = <ItemCover url={item.images[0]?.url} title={item.title} />
  return (
    <article className="tile">
      {href ? <Link href={href} className="item-card-link" aria-label={`View ${item.title}`}>{cover}</Link> : cover}
      <h3 className="tile-title">{href ? <Link href={href} className="item-card-title">{item.title}</Link> : item.title}</h3>
      <p className="price text-sm">{formatRate(item.dailyRate)}</p>
      {badge && <div className="tile-badge"><Badge tone={badge.tone}>{badge.label}</Badge></div>}
      {children && <div className="tile-footer">{children}</div>}
    </article>
  )
}
