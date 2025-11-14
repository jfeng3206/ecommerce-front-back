import type { OrderResponse, OrderStatusUpdate } from '../../api/orders'
import type { PaymentDto } from '../../api/payments'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

type LoadState = 'idle' | 'loading' | 'success' | 'error'

type OrderDetailsPanelProps = {
  order: OrderResponse | null
  status: LoadState
  error: string | null
  selectedOrderId: string | null
  onClearSelection: () => void
  canCancel: boolean
  onCancel?: () => void
  cancelStatus?: LoadState
  cancelMessage?: string | null
  payments?: PaymentDto[] | null
  paymentsStatus?: LoadState
  paymentsError?: string | null
  showPayments?: boolean
}

type DisplayNote = {
  id: string
  text: string
  createdAt?: string
  recordedBy?: string
}

type DisplayStatus = OrderStatusUpdate & { id: string }

export function OrderDetailsPanel({
  order,
  status,
  error,
  selectedOrderId,
  onClearSelection,
  canCancel,
  onCancel,
  cancelStatus = 'idle',
  cancelMessage,
  payments,
  paymentsStatus = 'idle',
  paymentsError,
  showPayments = false,
}: OrderDetailsPanelProps) {
  const notes = order ? buildFulfillmentNotes(order) : []
  const history = order ? buildStatusHistory(order) : []
  const showCancelFeedback = Boolean(cancelMessage)
  const hasPayments = showPayments && payments && payments.length > 0

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Order details
          </p>
          {selectedOrderId ? (
            <p className="text-sm font-semibold text-slate-900">{selectedOrderId}</p>
          ) : (
            <p className="text-sm text-slate-500">Pick an order from the list to inspect.</p>
          )}
        </div>
        {selectedOrderId && (
          <button
            type="button"
            onClick={onClearSelection}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {status === 'idle' && !order && (
        <p className="pt-4 text-sm text-slate-500">
          Select any record to view line items, fulfillment notes, and the latest status updates.
        </p>
      )}

      {status === 'loading' && (
        <p className="pt-4 text-sm text-slate-500">Fetching order details…</p>
      )}

      {status === 'error' && (
        <p className="pt-4 text-sm text-red-600">{error}</p>
      )}

      {status === 'success' && order && (
        <div className="space-y-6 pt-4">
          {canCancel && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">Need to stop this order before shipment?</p>
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={cancelStatus === 'loading'}
                  className="rounded-full bg-red-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white disabled:opacity-60"
                >
                  {cancelStatus === 'loading' ? 'Cancelling…' : 'Cancel order'}
                </button>
              </div>
              {showCancelFeedback && (
                <p
                  className={`mt-2 text-sm ${
                    cancelStatus === 'error' ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {cancelMessage}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                {order.orderStatus}
              </span>
              <p className="text-xs text-slate-500">
                Created {new Date(order.createdAt).toLocaleString()} • Updated{' '}
                {new Date(order.updatedAt).toLocaleString()}
              </p>
            </div>
            <p className="text-2xl font-semibold text-brand">{currency.format(order.totalAmount)}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Items</h3>
            <ul className="mt-2 divide-y divide-slate-100 text-sm">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-slate-900">{item.productName}</p>
                    <p className="text-xs text-slate-500">
                      {currency.format(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {currency.format(item.totalPrice)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Fulfillment notes
              </h3>
              {order.hasBackorderedItems && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Backorder
                </span>
              )}
            </div>
            {notes.length === 0 && (
              <p className="mt-2 text-sm text-slate-500">No fulfillment notes yet.</p>
            )}
            {notes.length > 0 && (
              <ul className="mt-2 space-y-2 text-sm">
                {notes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-xl bg-slate-50 p-3 text-slate-700"
                  >
                    <p>{note.text}</p>
                    {(note.createdAt || note.recordedBy) && (
                      <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                        {note.createdAt && new Date(note.createdAt).toLocaleString()}
                        {note.createdAt && note.recordedBy ? ' • ' : ''}
                        {note.recordedBy}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Status updates
            </h3>
            <ol className="mt-3 space-y-3">
              {history.map((entry) => (
                <li key={entry.id} className="relative pl-6 text-sm text-slate-700">
                  <span className="absolute left-1 top-1 h-2 w-2 rounded-full bg-brand" aria-hidden />
                  <p className="font-semibold text-slate-900">{entry.status}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(entry.changedAt).toLocaleString()}
                    {entry.actor ? ` • ${entry.actor}` : ''}
                  </p>
                  {entry.description && <p className="text-sm text-slate-600">{entry.description}</p>}
                </li>
              ))}
            </ol>
          </div>

          {showPayments && (
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Payments
                </h3>
                {hasPayments && (
                  <span className="text-xs text-slate-500">{payments?.length} record(s)</span>
                )}
              </div>
              {paymentsStatus === 'loading' && (
                <p className="mt-2 text-sm text-slate-500">Loading payments…</p>
              )}
              {paymentsStatus === 'error' && (
                <p className="mt-2 text-sm text-red-600">{paymentsError}</p>
              )}
              {paymentsStatus === 'success' && hasPayments && (
                <div className="mt-3 space-y-3">
                  {payments!.map((payment) => (
                    <article
                      key={payment.paymentReference}
                      className="rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900">{payment.paymentReference}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(payment.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${paymentStatusClasses(payment.status)}`}
                        >
                          {payment.status}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900">
                          {currency.format(payment.amount)} {payment.currency}
                        </p>
                        {payment.method?.last4 && (
                          <p className="text-xs text-slate-500">
                            {payment.method.type} •••• {payment.method.last4}
                          </p>
                        )}
                      </div>
                      {payment.refundReason && (
                        <p className="mt-1 text-xs text-amber-600">
                          Refund note: {payment.refundReason}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
              {paymentsStatus === 'success' && !hasPayments && (
                <p className="mt-2 text-sm text-slate-500">No payment records yet.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function buildFulfillmentNotes(order: OrderResponse): DisplayNote[] {
  const provided = order.fulfillmentNotes ?? []
  if (provided.length > 0) {
    return provided.map((note, index) =>
      typeof note === 'string'
        ? {
            id: `${order.orderId}-note-${index}`,
            text: note,
          }
        : {
            id: `${order.orderId}-note-${note.id ?? index}`,
            text: note.note,
            createdAt: note.createdAt,
            recordedBy: note.recordedBy,
          },
    )
  }

  const derived: DisplayNote[] = []
  if (order.hasBackorderedItems) {
    derived.push({
      id: `${order.orderId}-backorder`,
      text: 'Operations flagged this order for backorder handling. You will receive shipment alerts as soon as inventory is released.',
    })
  }
  if (order.skippedSkus && order.skippedSkus.length > 0) {
    derived.push({
      id: `${order.orderId}-skipped`,
      text: `The following SKUs could not be reserved: ${order.skippedSkus.join(', ')}.`,
    })
  }
  return derived
}

function buildStatusHistory(order: OrderResponse): DisplayStatus[] {
  const provided = order.statusHistory ?? []
  const sorted = provided
    .map((entry, index) => ({
      ...entry,
      id: `${order.orderId}-status-${index}`,
    }))
    .sort((a, b) => Date.parse(b.changedAt) - Date.parse(a.changedAt))

  if (sorted.length > 0) {
    return sorted
  }

  const fallback: DisplayStatus[] = [
    {
      id: `${order.orderId}-created`,
      status: 'CREATED',
      changedAt: order.createdAt,
      description: 'Order submitted and awaiting processing.',
    },
  ]

  const isDistinctStatus = order.orderStatus !== 'CREATED'
  const isDistinctTimestamp = order.updatedAt !== order.createdAt

  if (isDistinctStatus || isDistinctTimestamp) {
    fallback.push({
      id: `${order.orderId}-current`,
      status: order.orderStatus,
      changedAt: order.updatedAt,
      description: 'Latest status reported by the service.',
    })
  }

  return fallback
}

function paymentStatusClasses(status: string) {
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
