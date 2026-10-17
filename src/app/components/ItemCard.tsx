import Link from 'next/link'
import Badge, { Tone } from './Badge'
import ItemCover from './ItemCover'
import { formatRate } from '@/lib/format'

type Props = {
  item: { title: string; description: string; dailyRate: number; images: { url: string }[] }
  badge?: { tone: Tone; label: string }
  href?: string                // when set, the photo and the title open this page
  children?: React.ReactNode   // the footer: a button, a link, a note
}

// the one item card used on the dashboard and the browse page
export default function ItemCard({ item, badge, href, children }: Props) {
  return (
    <article className="card item-card">
      {href
        ? <Link href={href} className="item-card-link" aria-label={`View ${item.title}`}>
            <ItemCover url={item.images[0]?.url} title={item.title} />
          </Link>
        : <ItemCover url={item.images[0]?.url} title={item.title} />}
      <div className="row-between">
        <h3>{href ? <Link href={href} className="item-card-title">{item.title}</Link> : item.title}</h3>
        {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
      </div>
      <p className="muted text-sm">{item.description}</p>
      <p className="price">{formatRate(item.dailyRate)}</p>
      {children && <div className="card-footer">{children}</div>}
    </article>
  )
}
