import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  fetchProducts,
  createProduct,
  deleteProduct,
  type ProductDto,
} from '../../api/products'
import { fetchUsers, updateUser, deleteUser, type UserProfile } from '../../api/users'
import { useAuth } from '../auth/AuthContext'
import { isAdminRole } from '../../lib/roles'

const defaultProductForm = {
  name: '',
  price: '',
  stock: '',
  sku: '',
  description: '',
  imageUrl: '',
}

type LoadState = 'idle' | 'loading' | 'success' | 'error'

export function AdminPage() {
  const { role } = useAuth()
  const isAdmin = isAdminRole(role)

  if (!isAdmin) {
    return (
      <section className="space-y-4">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin</p>
          <h1 className="text-3xl font-semibold text-brand">Restricted area</h1>
        </header>
        <p className="text-sm text-slate-500">
          You need an administrator role to manage products and users. Please sign in with elevated access.
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin console</p>
        <h1 className="text-3xl font-semibold text-brand">Products & users</h1>
        <p className="text-sm text-slate-600">
          Create and update products, manage user roles, and keep the catalog aligned with backend data.
        </p>
      </header>

      <ProductAdminPanel />
      <UserAdminPanel />
    </section>
  )
}

function ProductAdminPanel() {
  const [products, setProducts] = useState<ProductDto[]>([])
  const [status, setStatus] = useState<LoadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(defaultProductForm)
  const [formStatus, setFormStatus] = useState<LoadState>('idle')
  const [formMessage, setFormMessage] = useState<string | null>(null)

  const refreshProducts = () => {
    setStatus('loading')
    setError(null)
    fetchProducts({ pageSize: 50 })
      .then((response) => {
        setProducts(response.content)
        setStatus('success')
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unable to load products')
        setStatus('error')
      })
  }

  useEffect(() => {
    refreshProducts()
  }, [])

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormStatus('loading')
    setFormMessage(null)
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim() || undefined,
        description: form.description.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        price: Number(form.price),
        stock: Number(form.stock),
      }
      if (!payload.name || Number.isNaN(payload.price) || Number.isNaN(payload.stock)) {
        throw new Error('Provide valid name, price, and stock values.')
      }
      await createProduct(payload)
      setForm(defaultProductForm)
      setFormStatus('success')
      setFormMessage('Product created successfully.')
      refreshProducts()
    } catch (err) {
      setFormStatus('error')
      setFormMessage(err instanceof Error ? err.message : 'Unable to create product')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this product? This action cannot be undone.')) return
    try {
      await deleteProduct(id)
      setProducts((prev) => prev.filter((product) => product.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unable to delete product')
    }
  }

  const totalInventory = useMemo(
    () => products.reduce((sum, product) => sum + (product.stock ?? 0), 0),
    [products],
  )

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Products</p>
        <h2 className="text-2xl font-semibold text-slate-900">Catalog control</h2>
        <p className="text-sm text-slate-500">Create items or adjust existing entries before releasing to shoppers.</p>
      </header>

      {status === 'loading' && <p className="text-sm text-slate-500">Loading products…</p>}
      {status === 'error' && <p className="text-sm text-red-600">{error}</p>}

      {status === 'success' && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {products.length} products • {totalInventory} units on hand
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {products.map((product) => (
              <article key={product.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">SKU {product.sku ?? 'N/A'}</p>
                  </div>
                  <p className="text-base font-semibold text-brand">${Number(product.price).toFixed(2)}</p>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Stock {product.stock ?? 0} • Reserved {product.reserved ?? 0}
                </p>
                {product.description && (
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{product.description}</p>
                )}
                <div className="mt-3 flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    className="rounded-full border border-red-200 px-3 py-1 font-semibold uppercase tracking-wide text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleCreate} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Create product</h3>
          <p className="text-xs text-slate-500">Fill out minimal fields; you can enrich details later.</p>
        </div>
        <label className="block text-sm font-medium text-slate-600">
          Name
          <input
            type="text"
            required
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm font-medium text-slate-600">
            Price
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={form.price}
              onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            Stock
            <input
              type="number"
              min="0"
              required
              value={form.stock}
              onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="block text-sm font-medium text-slate-600">
          SKU
          <input
            type="text"
            value={form.sku}
            onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-slate-600">
          Description
          <textarea
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={3}
          />
        </label>
        <label className="block text-sm font-medium text-slate-600">
          Image URL
          <input
            type="url"
            value={form.imageUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        {formMessage && (
          <p className={`text-sm ${formStatus === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>{formMessage}</p>
        )}
        <button
          type="submit"
          className="w-full rounded-full bg-brand px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white"
          disabled={formStatus === 'loading'}
        >
          {formStatus === 'loading' ? 'Saving…' : 'Create product'}
        </button>
      </form>
    </section>
  )
}

function UserAdminPanel() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [status, setStatus] = useState<LoadState>('idle')
  const [error, setError] = useState<string | null>(null)

  const refreshUsers = () => {
    setStatus('loading')
    setError(null)
    fetchUsers({ pageSize: 50 })
      .then((response) => {
        setUsers(response.content)
        setStatus('success')
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unable to load users')
        setStatus('error')
      })
  }

  useEffect(() => {
    refreshUsers()
  }, [])

  const handleRoleChange = async (id: number, role: UserProfile['role']) => {
    try {
      const updated = await updateUser(id, { role })
      setUsers((prev) => prev.map((user) => (user.id === id ? updated : user)))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unable to update user')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this user? They will lose access.')) return
    try {
      await deleteUser(id)
      setUsers((prev) => prev.filter((user) => user.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unable to delete user')
    }
  }

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Users</p>
        <h2 className="text-2xl font-semibold text-slate-900">Account management</h2>
        <p className="text-sm text-slate-500">Promote operators, deactivate test users, and keep roles tidy.</p>
      </header>

      {status === 'loading' && <p className="text-sm text-slate-500">Loading users…</p>}
      {status === 'error' && <p className="text-sm text-red-600">{error}</p>}

      {status === 'success' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(event) => handleRoleChange(user.id, event.target.value as UserProfile['role'])}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-sm"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="PAYMENT_ADMIN">PAYMENT_ADMIN</option>
                      <option value="SERVICE_ORDER">SERVICE_ORDER</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(user.id)}
                      className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
