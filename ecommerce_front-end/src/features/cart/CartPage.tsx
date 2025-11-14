import { useMemo, useState } from 'react'
import { useCart } from './CartContext'
import { createOrder } from '../../api/orders'
import { useAuth } from '../auth/AuthContext'

export function CartPage() {
  const { state, updateQuantity, removeItem, clear } = useCart()
  const { token } = useAuth()
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [paymentForm, setPaymentForm] = useState({
    cardholderName: '',
    last4: '',
  })

  const items = Object.values(state.items)
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])

  const handleCheckout = async () => {
    if (!token) {
      setMessage('Sign in to place an order.')
      return
    }
    if (items.length === 0) {
      setMessage('Add items to your cart before checking out.')
      return
    }
    if (!paymentForm.cardholderName.trim()) {
      setStatus('error')
      setMessage('Enter the cardholder name to continue.')
      return
    }
    if (!/^\d{4}$/.test(paymentForm.last4.trim())) {
      setStatus('error')
      setMessage('Enter the last four digits of the card (numbers only).')
      return
    }
    setStatus('loading')
    setMessage(null)
    try {
      await createOrder({
        currency: 'USD',
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        paymentMethod: {
          type: 'CARD',
          cardholderName: paymentForm.cardholderName.trim(),
          last4: paymentForm.last4.trim(),
        },
      })
      setStatus('success')
      setMessage('Order placed successfully!')
      clear()
      setPaymentForm({ cardholderName: '', last4: '' })
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Unable to create order')
    }
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Cart
        </p>
        <h1 className="text-3xl font-semibold text-brand">Review your cart</h1>
        <p className="text-sm text-slate-600">Items stay in your cart until you place an order.</p>
      </header>

      {message && (
        <div className={`rounded-2xl border p-4 text-sm ${status === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
          {message}
        </div>
      )}

      {items.length === 0 && <p className="text-sm text-slate-500">Your cart is empty.</p>}

      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.productId} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-xl bg-slate-100">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                      No image
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">${item.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                  className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Remove
                </button>
              </div>
              <p className="text-base font-semibold text-slate-900">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </article>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-slate-700">Payment method</p>
            <p className="text-xs text-slate-500">Provide the last four digits used for this order.</p>
          </div>
          <label className="block text-sm font-medium text-slate-600">
            Cardholder name
            <input
              type="text"
              required
              value={paymentForm.cardholderName}
              onChange={(event) =>
                setPaymentForm((prev) => ({ ...prev, cardholderName: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Jane Doe"
            />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            Last four digits
            <input
              type="text"
              inputMode="numeric"
              required
              value={paymentForm.last4}
              onChange={(event) =>
                setPaymentForm((prev) => ({ ...prev, last4: event.target.value.replace(/[^0-9]/g, '') }))
              }
              maxLength={4}
              className="mt-1 w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="4242"
            />
          </label>
          <div className="flex items-center justify-between text-lg font-semibold text-slate-900">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            className="w-full rounded-full bg-brand px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Placing order…' : 'Place order'}
          </button>
        </div>
      )}
    </section>
  )
}
