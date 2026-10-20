// Thin Paystack client. Only the calls Jirani needs, all server side with the secret key.
// Docs: https://paystack.com/docs/api/  (Kenya: KES, M-Pesa through hosted checkout, transfers to M-Pesa numbers)
import { AppError } from '@/lib/errors'
import { toSubunit } from '@/lib/payments'

// overridable so the flow can be tried against a local fake in development
const BASE = process.env.PAYSTACK_API_URL ?? 'https://api.paystack.co'

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) throw new AppError(503, 'Payments are not set up yet')
  return key
}

export const isTestMode = () => (process.env.PAYSTACK_SECRET_KEY ?? '').startsWith('sk_test_')

type PaystackResponse<T> = { status: boolean; message: string; data: T }

async function call<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      method: init.method ?? 'GET',
      headers: { Authorization: `Bearer ${secretKey()}`, 'Content-Type': 'application/json' },
      body: init.body ? JSON.stringify(init.body) : undefined,
      signal: AbortSignal.timeout(20_000),
    })
  } catch {
    throw new AppError(502, 'Could not reach the payment provider. Please try again.')
  }
  const json = (await res.json().catch(() => null)) as PaystackResponse<T> | null
  if (!res.ok || !json?.status) {
    console.error('Paystack error', path, res.status, json?.message)
    throw new AppError(502, json?.message ?? 'The payment provider rejected the request')
  }
  return json.data
}

export function initializeTransaction(args: { email: string; amountKes: number; reference: string; callbackUrl: string; metadata: Record<string, unknown> }) {
  return call<{ authorization_url: string; access_code: string; reference: string }>('/transaction/initialize', {
    method: 'POST',
    body: {
      email: args.email,
      amount: toSubunit(args.amountKes),
      currency: 'KES',
      reference: args.reference,
      callback_url: args.callbackUrl,
      channels: ['mobile_money', 'card'],
      metadata: args.metadata,
    },
  })
}

export type VerifiedTransaction = { status: string; amount: number; currency: string; reference: string; channel: string | null }

export function verifyTransaction(reference: string) {
  return call<VerifiedTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`)
}

// the owner's M-Pesa number, registered once and reused for every payout
export function createMpesaRecipient(args: { name: string; phone: string }) {
  return call<{ recipient_code: string }>('/transferrecipient', {
    method: 'POST',
    body: { type: 'mobile_money', name: args.name, account_number: args.phone, bank_code: 'MPESA', currency: 'KES' },
  })
}

export function initiateTransfer(args: { amountKes: number; recipientCode: string; reference: string; reason: string }) {
  return call<{ status: string; transfer_code: string; reference: string }>('/transfer', {
    method: 'POST',
    body: { source: 'balance', amount: toSubunit(args.amountKes), recipient: args.recipientCode, reference: args.reference, reason: args.reason, currency: 'KES' },
  })
}

export function refundTransaction(reference: string) {
  return call<{ status: string }>('/refund', { method: 'POST', body: { transaction: reference } })
}
