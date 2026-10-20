// Paystack sends the borrower back here after checkout (?reference=...).
// We ask Paystack what happened instead of trusting the address, then show the result.
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/currentUser'
import { confirmPayment } from '@/services/paymentServices'
import { userMessage } from '@/lib/errors'
import PageHeader from '../../components/PageHeader'

export const metadata = { title: 'Payment' }

export default async function PaymentCallback({ searchParams }: { searchParams: Promise<{ reference?: string; trxref?: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const reference = params.reference ?? params.trxref
  const own = reference
    ? await prisma.payment.findUnique({ where: { reference }, include: { booking: { include: { item: true } } } })
    : null
  // only the borrower sees the result of their own payment
  if (!own || own.booking.borrowerId !== user.id) {
    return (
      <div className="page page-narrow">
        <PageHeader title="Payment not found" />
        <Link href="/bookings" className="btn btn-primary">Back to Requests</Link>
      </div>
    )
  }

  let status = own.status
  let problem = ''
  try {
    status = (await confirmPayment(own.reference)).status
  } catch (error) {
    problem = userMessage(error, 'We could not confirm the payment yet.')
  }

  const title = status === 'PAID' ? 'Payment received' : status === 'FAILED' ? 'Payment failed' : 'Payment pending'
  const text = status === 'PAID'
    ? `KES ${own.amount.toLocaleString('en-KE')} for ${own.booking.item.title} is paid. Your booking is confirmed.`
    : status === 'FAILED'
      ? 'The payment did not go through. You can try again from your booking.'
      : 'We have not received confirmation yet. This page updates when you refresh, and the booking shows Paid once it arrives.'

  return (
    <div className="page page-narrow">
      <PageHeader title={title} />
      <p>{text}</p>
      {problem && <p className="form-error" role="alert">{problem}</p>}
      <p className="muted text-sm">Reference {own.reference}</p>
      <div className="cluster" style={{ marginTop: 'var(--space-5)' }}>
        <Link href="/bookings" className="btn btn-primary">See my requests</Link>
        <Link href="/payments" className="btn btn-outline">Payment history</Link>
      </div>
    </div>
  )
}
