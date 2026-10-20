// Payment history: what you paid as a borrower and what was paid out to you as an owner.
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/currentUser'
import { isTestMode } from '@/lib/paystack'
import { formatDay } from '@/lib/format'
import PageHeader from '../components/PageHeader'
import Section from '../components/Section'
import EmptyState from '../components/EmptyState'

export const metadata = { title: 'Payments' }

const kes = (n: number) => `KES ${n.toLocaleString('en-KE')}`
const label = (s: string) => s.charAt(0) + s.slice(1).toLowerCase()

export default async function PaymentsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const include = { booking: { include: { item: true } } }
  const [paid, received] = await Promise.all([
    prisma.payment.findMany({ where: { booking: { borrowerId: user.id } }, include, orderBy: { createdAt: 'desc' } }),
    prisma.payment.findMany({ where: { booking: { item: { ownerId: user.id }, status: { in: ['APPROVED', 'RETURNED'] } }, status: 'PAID' }, include, orderBy: { createdAt: 'desc' } }),
  ])

  return (
    <div className="page">
      <PageHeader title="Payments" />
      {isTestMode() && <p className="notice">Test mode: no real money moves. Use Paystack test numbers and cards.</p>}

      <Section title="Payments you made" narrow>
        {paid.length === 0
          ? <EmptyState message="No payments yet. You pay after an owner approves your request." />
          : (
            <div className="rows">
              {paid.map(p => (
                <article key={p.id} className="row-item stack">
                  <div className="row-between">
                    <div className="row-main">
                      <h3 className="row-title">{p.booking.item.title}</h3>
                      <p className="muted text-sm">{formatDay(p.booking.startDate)} to {formatDay(p.booking.endDate)} · {kes(p.amount)}</p>
                      <p className="muted text-sm">Reference {p.reference}</p>
                      {p.refundStatus !== 'NONE' && <p className="text-sm pay-note pay-wait">Refund {label(p.refundStatus)}{p.refundNote ? `: ${p.refundNote}` : ''}</p>}
                    </div>
                    <span className={`badge badge-${p.status === 'PAID' ? 'approved' : p.status === 'FAILED' ? 'rejected' : 'pending'}`}>{label(p.status)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
      </Section>

      {(user.canList || received.length > 0) && (
        <Section title="Payouts to you" narrow>
          <p className="muted text-sm" style={{ marginBottom: 'var(--space-3)' }}>
            Sent to the M-Pesa number on your account ({user.phone}) when you mark an item returned.
          </p>
          {received.length === 0
            ? <EmptyState message="No payouts yet." />
            : (
              <div className="rows">
                {received.map(p => (
                  <article key={p.id} className="row-item stack">
                    <div className="row-between">
                      <div className="row-main">
                        <h3 className="row-title">{p.booking.item.title}</h3>
                        <p className="muted text-sm">{kes(p.amount)} · {formatDay(p.booking.startDate)} to {formatDay(p.booking.endDate)}</p>
                        {p.payoutReference && <p className="muted text-sm">Reference {p.payoutReference}</p>}
                        {p.payoutNote && <p className="text-sm pay-note pay-bad">{p.payoutNote}</p>}
                      </div>
                      <span className={`badge badge-${p.payoutStatus === 'SUCCESS' ? 'approved' : p.payoutStatus === 'FAILED' ? 'rejected' : 'pending'}`}>
                        {p.payoutStatus === 'NONE' ? 'After return' : label(p.payoutStatus)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
        </Section>
      )}
    </div>
  )
}
