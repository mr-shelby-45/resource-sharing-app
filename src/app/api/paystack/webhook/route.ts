// Paystack calls this when a payment, payout or refund changes.
// There is no login here: the caller is proven by the signature on the raw body.
import { handleWebhook } from '@/services/paymentServices'
import { handleError } from '@/lib/apiHandler'

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()   // the signature is over the exact bytes, so do not parse first
    await handleWebhook(rawBody, request.headers.get('x-paystack-signature'))
    return Response.json({ received: true }, { status: 200 })
  } catch (error) {
    return handleError(error, 'Paystack webhook')
  }
}
