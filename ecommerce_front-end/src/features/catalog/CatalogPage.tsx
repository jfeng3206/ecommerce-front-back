import { useEffect, useState } from 'react'
import { useProducts } from './hooks/useProducts'
import { useAuth } from '../auth/AuthContext'
import { isAdminRole } from '../../lib/roles'
import { useCart } from '../cart/CartContext'
import type { ProductDto } from '../../api/products'

export function CatalogPage() {
  const [pageNo, setPageNo] = useState(0)
  const pageSize = 9
  const { data, status, error } = useProducts(pageNo, pageSize)
  const { role } = useAuth()
  const showAdminDetails = isAdminRole(role)
  const { addItem } = useCart()
  const [feedback, setFeedback] = useState<string | null>(null)
  const placeholderImage =
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(null), 2500)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const handleNext = () => {
    if (data?.last) return
    setPageNo((prev) => prev + 1)
  }

  const handlePrev = () => {
    if (!data || data.pageNo === 0) return
    setPageNo((prev) => Math.max(0, prev - 1))
  }

  const handleAddToCart = (product: ProductDto) => {
    addItem(product)
    setFeedback(`${product.name} added to cart.`)
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Catalog</p>
        <h1 className="text-3xl font-semibold text-brand">Browse the latest products</h1>
        <p className="text-sm text-slate-600">
          Explore curated products — find exactly what you need.
        </p>
      </header>

      {status === 'loading' && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading products…
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {status === 'success' && data && (
        <>
          {feedback && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {feedback}
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-3">
            {data.content.map((product) => (
              <article
                key={product.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={product.imageUrl || placeholderImage}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  {showAdminDetails && (
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                      <span>{product.sku ?? 'SKU N/A'}</span>
                      <span>{product.stock > 0 ? 'In stock' : 'Out of stock'}</span>
                    </div>
                  )}
                  <h2 className="text-lg font-semibold text-slate-900">{product.name}</h2>
                  {product.description && (
                    <p className="text-sm text-slate-600">{product.description}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between">
                    <p className="text-2xl font-bold text-brand">
                      ${Number(product.price).toFixed(2)}
                    </p>
                    <button
                      type="button"
                      className="rounded-full bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white"
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to cart
                    </button>
                  </div>
                  {showAdminDetails && (
                    <p className="text-xs text-slate-500">
                      Stock {product.stock} • Reserved {product.reserved ?? 0}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-sm">
            <button
              type="button"
              onClick={handlePrev}
              disabled={pageNo === 0}
              className="rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-600 disabled:opacity-50"
            >
              Previous
            </button>
            <p className="text-slate-600">
              Page {data.pageNo + 1} of {data.totalPages} • Showing {data.content.length} of{' '}
              {data.totalElements}
            </p>
            <button
              type="button"
              onClick={handleNext}
              disabled={data.last}
              className="rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  )
}
