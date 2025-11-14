import { useState } from 'react'
import type { FormEvent } from 'react'
import { fetchPaymentsByOrder, refundPayment, type PaymentDto } from '../../api/payments'
import { useAuth } from '../auth/AuthContext'
import { canManagePayments } from '../../lib/roles'

type LoadState = 'idle' | 'loading' | 'success' | 'error'

type ActionState = Record<string, { status: LoadState; message: string | null }>

export function PaymentsPage() {
  const { role } = useAuth()
  const canAdminPayments = canManagePayments(role)
  const [orderId, setOrderId] = useState('')
  const [payments, setPayments] = useState<PaymentDto[] | null>(null)
  const [status, setStatus] = useState<LoadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [actions, setActions] = useState<ActionState>({})

  if (!canAdminPayments) {
    return (
      <section className="space-y-4">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payments</p>
          <h1 className="text-3xl font-semibold text-brand">Restricted area</h1>
        </header>
        <p className="text-sm text-slate-500">
          Payment administration requires an <code>ADMIN</code>, <code>PAYMENT_ADMIN</code>, or
          <code> SERVICE_ORDER</code> role.
        </p>
      </section>
    )
  }

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!orderId.trim()) {
      setError('Enter an order ID to continue.')
      setStatus('error')
      return
    }
    setStatus('loading')
    setError(null)
    setPayments(null)
    setActions({})
    try {
      const result = await fetchPaymentsByOrder(orderId.trim())
      setPayments(result)
      setStatus('success')
      if (result.length === 0) {
        setError('No payment activity for this order yet.')
      }
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Unable to load payments for this order')
    }
  }

  const handleRefund = async (payment: PaymentDto) => {
    const reason = window.prompt('Provide a refund reason', 'Manual admin refund')
    if (reason === null) return
    const trimmedReason = reason.trim()
    if (!trimmedReason) {
      window.alert('Refund cancelled: reason is required.')
      return
    }
    const idempotencyKey = `refund-${payment.paymentReference}-${Date.now()}`
    setActions((prev) => ({
      ...prev,
      [payment.paymentReference]: { status: 'loading', message: null },
    }))
    try {
      const updated = await refundPayment(payment.paymentReference, {
        reason: trimmedReason,
        idempotencyKey,
      })
      setPayments((prev) =>
        prev?.map((entry) => (entry.paymentReference === updated.paymentReference ? updated : entry)) ?? prev,
      )
      setActions((prev) => ({
        ...prev,
        [payment.paymentReference]: {
          status: 'success',
          message: 'Refund submitted. Status will update when processed.',
        },
      }))
    } catch (err) {
      setActions((prev) => ({
        ...prev,
        [payment.paymentReference]: {
          status: 'error',
          message: err instanceof Error ? err.message : 'Refund failed',
        },
      }))
    }
  }

  const renderPaymentCard = (payment: PaymentDto) => {
    const action = actions[payment.paymentReference]
    const canRefund = payment.status === 'COMPLETED'

    return (
      <article
        key={payment.paymentReference}
        className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-900">{payment.paymentReference}</p>
            <p className="text-xs text-slate-500">Order {payment.orderId}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusBadge(payment.status)}`}>
            {payment.status}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="font-semibold text-slate-900">
            {payment.currency} {payment.amount.toFixed(2)}
          </p>
          {payment.method?.last4 && (
            <p className="text-xs text-slate-500">
              {payment.method.type} •••• {payment.method.last4}
            </p>
          )}
        </div>
        {payment.refundReason && (
          <p className="text-xs text-amber-600">Refund note: {payment.refundReason}</p>
        )}
        {canRefund && (
          <button
            type="button"
            onClick={() => handleRefund(payment)}
            disabled={action?.status === 'loading'}
            className="rounded-full bg-red-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white disabled:opacity-60"
          >
            {action?.status === 'loading' ? 'Submitting…' : 'Refund payment'}
          </button>
        )}
        {action?.message && (
          <p
            className={`text-xs ${
              action.status === 'error' ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {action.message}
          </p>
        )}
      </article>
    )
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payments</p>
        <h1 className="text-3xl font-semibold text-brand">Monitor & refund</h1>
        <p className="text-sm text-slate-600">
          Look up payments tied to an order ID, review their status, and trigger refunds with idempotency safety.
        </p>
      </header>

      <form onSubmit={handleSearch} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="block text-sm font-medium text-slate-600">
          Order ID
          <input
            type="text"
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="e.g. ORD-123"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Searching…' : 'Lookup payments'}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {status === 'success' && payments && payments.length > 0 && (
        <div className="space-y-3">
          {payments.map((payment) => renderPaymentCard(payment))}
        </div>
      )}

      {status === 'idle' && (
        <p className="text-sm text-slate-500">Enter an order ID to start monitoring payments.</p>
      )}
    </section>
  )
}

function statusBadge(status: PaymentDto['status']) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-700'
    case 'REFUNDED':
      return 'bg-amber-100 text-amber-700'
    case 'FAILED':
      return 'bg-red-100 text-red-600'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}
