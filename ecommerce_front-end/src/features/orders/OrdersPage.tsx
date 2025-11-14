import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  fetchMyOrders,
  fetchOrders,
  fetchOrderById,
  cancelOrder,
  type OrderResponse,
  type OrderAllResponse,
} from '../../api/orders'
import { fetchPaymentsByOrder, type PaymentDto } from '../../api/payments'
import { useAuth } from '../auth/AuthContext'
import { canManagePayments, isAdminRole } from '../../lib/roles'
import { OrderDetailsPanel } from './OrderDetailsPanel'

type LoadState = 'idle' | 'loading' | 'success' | 'error'

export function OrdersPage() {
  const { token, role } = useAuth()
  const isAdmin = isAdminRole(role)
  const isCustomer = role === 'USER'
  const canViewPayments = canManagePayments(role)
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedOrderId = searchParams.get('orderId')
  const [myOrders, setMyOrders] = useState<OrderResponse[] | null>(null)
  const [myStatus, setMyStatus] = useState<LoadState>('idle')
  const [myError, setMyError] = useState<string | null>(null)

  const [adminOrders, setAdminOrders] = useState<OrderAllResponse | null>(null)
  const [adminStatus, setAdminStatus] = useState<LoadState>('idle')
  const [adminError, setAdminError] = useState<string | null>(null)
  const [adminPage, setAdminPage] = useState(0)
  const pageSize = 5
  const [detailStatus, setDetailStatus] = useState<LoadState>('idle')
  const [detailError, setDetailError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null)
  const [cancelStatus, setCancelStatus] = useState<LoadState>('idle')
  const [cancelMessage, setCancelMessage] = useState<string | null>(null)
  const [payments, setPayments] = useState<PaymentDto[] | null>(null)
  const [paymentsStatus, setPaymentsStatus] = useState<LoadState>('idle')
  const [paymentsError, setPaymentsError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const triggerReload = () => setReloadKey((prev) => prev + 1)

  useEffect(() => {
    if (!token) {
      setMyOrders(null)
      return
    }
    let cancelled = false
    setMyStatus('loading')
    setMyError(null)
    fetchMyOrders()
      .then((orders) => {
        if (!cancelled) {
          setMyOrders(orders)
          setMyStatus('success')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setMyError(err instanceof Error ? err.message : 'Unable to load orders')
          setMyStatus('error')
        }
      })
    return () => {
      cancelled = true
    }
  }, [token, reloadKey])

  useEffect(() => {
    if (!isAdmin) {
      setAdminOrders(null)
      return
    }
    let cancelled = false
    setAdminStatus('loading')
    setAdminError(null)
    fetchOrders({ pageNo: adminPage, pageSize })
      .then((response) => {
        if (!cancelled) {
          setAdminOrders(response)
          setAdminStatus('success')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setAdminError(err instanceof Error ? err.message : 'Unable to load admin orders')
          setAdminStatus('error')
        }
      })
    return () => {
      cancelled = true
    }
  }, [isAdmin, adminPage, reloadKey])

  useEffect(() => {
    if (!selectedOrderId || !token) {
      setSelectedOrder(null)
      setDetailStatus('idle')
      setDetailError(null)
      setCancelStatus('idle')
      setCancelMessage(null)
      setPayments(null)
      setPaymentsStatus('idle')
      setPaymentsError(null)
      return
    }

    let cancelled = false
    setDetailStatus('loading')
    setDetailError(null)

    fetchOrderById(selectedOrderId)
      .then((order) => {
        if (!cancelled) {
          setSelectedOrder(order)
          setDetailStatus('success')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setDetailError(err instanceof Error ? err.message : 'Unable to load order details')
          setDetailStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [selectedOrderId, token])

  useEffect(() => {
    if (!selectedOrderId || !token || !canViewPayments) {
      setPayments(null)
      setPaymentsStatus('idle')
      setPaymentsError(null)
      return
    }

    let cancelled = false
    setPaymentsStatus('loading')
    setPaymentsError(null)

    fetchPaymentsByOrder(selectedOrderId)
      .then((response) => {
        if (!cancelled) {
          setPayments(response)
          setPaymentsStatus('success')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setPaymentsStatus('error')
          setPaymentsError(err instanceof Error ? err.message : 'Unable to load payments')
        }
      })

    return () => {
      cancelled = true
    }
  }, [selectedOrderId, token, canViewPayments, reloadKey])

  const handleSelectOrder = (orderId: string) => {
    setCancelStatus('idle')
    setCancelMessage(null)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('orderId', orderId)
      return next
    })
  }

  const handleClearSelection = () => {
    setCancelStatus('idle')
    setCancelMessage(null)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('orderId')
      return next
    })
  }

  const handleCancelSelected = async () => {
    if (!selectedOrderId) return
    setCancelStatus('loading')
    setCancelMessage(null)
    try {
      await cancelOrder(selectedOrderId)
      setCancelStatus('success')
      setCancelMessage('Cancellation requested. Status will refresh shortly.')
      const updated = await fetchOrderById(selectedOrderId)
      setSelectedOrder(updated)
      triggerReload()
    } catch (err) {
      setCancelStatus('error')
      setCancelMessage(err instanceof Error ? err.message : 'Unable to cancel order')
    }
  }

  const sortedMyOrders = useMemo(() => {
    if (!myOrders) return []
    return [...myOrders].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  }, [myOrders])

  const canCancelSelected = Boolean(
    selectedOrder &&
    isCustomer &&
    isCancelableStatus(selectedOrder.orderStatus),
  )

  return (
    <section className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Orders
        </p>
        <h1 className="text-3xl font-semibold text-brand">Order history</h1>
        <p className="text-sm text-slate-600">
          Customers can review their recent orders; admins get a global snapshot for all orders.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Your orders</h2>
        {!token && <p className="text-sm text-slate-500">Sign in to view your orders.</p>}
        {token && myStatus === 'loading' && <p className="text-sm text-slate-500">Loading…</p>}
        {token && myStatus === 'error' && (
          <p className="text-sm text-red-600">{myError}</p>
        )}
        {token && myStatus === 'success' && sortedMyOrders.length === 0 && (
          <p className="text-sm text-slate-500">No orders yet. Start shopping!</p>
        )}
        {token && sortedMyOrders.length > 0 && (
          <div className="space-y-3">
            {sortedMyOrders.map((order) => (
              <article
                key={order.orderId}
                className={`rounded-2xl border bg-white p-4 shadow-sm ${
                  selectedOrderId === order.orderId ? 'border-brand ring-1 ring-brand' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{order.orderId}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {order.orderStatus}
                  </span>
                  <p className="text-lg font-semibold text-brand">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-slate-600">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.productName} × {item.quantity} • ${item.totalPrice.toFixed(2)}
                    </li>
                  ))}
                </ul>
                {order.hasBackorderedItems && (
                  <p className="mt-2 text-xs text-amber-600">
                    Backordered items detected. You will be notified when they ship.
                  </p>
                )}
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSelectOrder(order.orderId)}
                    className="text-xs font-semibold uppercase tracking-wide text-brand underline"
                  >
                    View details
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {isAdmin && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">All orders (admin)</h2>
          {adminStatus === 'loading' && <p className="text-sm text-slate-500">Loading…</p>}
          {adminStatus === 'error' && (
            <p className="text-sm text-red-600">{adminError}</p>
          )}
          {adminStatus === 'success' && adminOrders && (
            <>
              <div className="space-y-3">
                {adminOrders.content.map((order) => (
                  <article
                    key={order.orderId}
                    className={`rounded-2xl border bg-white p-4 shadow-sm ${
                      selectedOrderId === order.orderId ? 'border-brand ring-1 ring-brand' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{order.orderId}</p>
                        <p className="text-xs text-slate-500">
                          User {order.userId} • {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {order.orderStatus}
                      </span>
                      <p className="text-base font-semibold text-brand">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {order.items.length} items • Backorder {order.hasBackorderedItems ? 'Yes' : 'No'}
                    </p>
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSelectOrder(order.orderId)}
                        className="text-xs font-semibold uppercase tracking-wide text-brand underline"
                      >
                        View details
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-sm">
                <button
                  type="button"
                  onClick={() => setAdminPage((prev) => Math.max(0, prev - 1))}
                  disabled={adminPage === 0}
                  className="rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-600 disabled:opacity-50"
                >
                  Previous
                </button>
                <p className="text-slate-600">
                  Page {adminOrders.pageNo + 1} of {adminOrders.totalPages}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (!adminOrders.last) setAdminPage((prev) => prev + 1)
                  }}
                  disabled={adminOrders.last}
                  className="rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-600 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Order details</h2>
        <OrderDetailsPanel
          order={selectedOrder}
          status={detailStatus}
          error={detailError}
          selectedOrderId={selectedOrderId}
          onClearSelection={handleClearSelection}
          canCancel={canCancelSelected}
          onCancel={handleCancelSelected}
          cancelStatus={cancelStatus}
          cancelMessage={cancelMessage}
          payments={payments}
          paymentsStatus={paymentsStatus}
          paymentsError={paymentsError}
          showPayments={canViewPayments}
        />
      </section>
    </section>
  )
}

const NON_CANCELABLE_STATUSES = new Set([
  'CANCELED',
  'CANCELLED',
  'SHIPPED',
  'DELIVERED',
  'FULFILLED',
  'COMPLETED',
])

function isCancelableStatus(status?: string | null) {
  if (!status) return false
  return !NON_CANCELABLE_STATUSES.has(status.toUpperCase())
}
