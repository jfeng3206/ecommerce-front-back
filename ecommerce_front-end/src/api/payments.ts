import { apiFetch } from './http'
import { tokenStorage } from '../lib/tokenStorage'

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export type PaymentMethod = {
  type: string
  last4?: string
  cardholderName?: string
  provider?: string
}

export type PaymentDto = {
  paymentReference: string
  orderId: string
  amount: number
  currency: string
  status: PaymentStatus
  createdAt: string
  updatedAt: string
  method?: PaymentMethod
  refundReason?: string
  refundStatus?: PaymentStatus
}

type PaymentsByOrderResponse = PaymentDto[]

type RefundPayload = {
  reason: string
  idempotencyKey: string
}

function authHeaders(extra?: Record<string, string>) {
  const token = tokenStorage.get()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra ?? {}),
  }
}

export function fetchPaymentsByOrder(orderId: string) {
  return apiFetch<PaymentsByOrderResponse>(`/payments/order/${orderId}`, {
    headers: authHeaders(),
  })
}

export function fetchPayment(paymentReference: string) {
  return apiFetch<PaymentDto>(`/payments/${paymentReference}`, {
    headers: authHeaders(),
  })
}

export function refundPayment(paymentReference: string, payload: RefundPayload) {
  return apiFetch<PaymentDto>(`/payments/${paymentReference}/refund`, {
    method: 'POST',
    body: JSON.stringify({ reason: payload.reason, idempotencyKey: payload.idempotencyKey }),
    headers: authHeaders({ 'Idempotency-Key': payload.idempotencyKey }),
  })
}
