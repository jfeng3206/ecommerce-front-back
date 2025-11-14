import { apiFetch } from './http'
import { tokenStorage } from '../lib/tokenStorage'

export type ProductDto = {
  id: number
  name: string
  price: number
  stock: number
  reserved?: number
  description?: string
  sku?: string
  categoryId?: number
  imageUrl?: string
}

export type ProductResponse = {
  content: ProductDto[]
  pageNo: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

export type ProductCreateRequest = {
  name: string
  price: number
  stock: number
  description?: string
  sku?: string
  imageUrl?: string
  categoryId?: number
}

export type ProductUpdateRequest = Partial<ProductCreateRequest>

function authHeaders(): Record<string, string> | undefined {
  const token = tokenStorage.get()
  if (!token) return undefined
  return { Authorization: `Bearer ${token}` }
}

export async function fetchProducts(params?: {
  pageNo?: number
  pageSize?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  search?: string
}) {
  const search = new URLSearchParams()
  if (params?.pageNo !== undefined) search.set('pageNo', params.pageNo.toString())
  if (params?.pageSize !== undefined) search.set('pageSize', params.pageSize.toString())
  if (params?.sortBy) search.set('sortBy', params.sortBy)
  if (params?.sortDir) search.set('sortDir', params.sortDir)
  if (params?.search) search.set('search', params.search)
  const qs = search.toString()
  const path = qs ? `/products?${qs}` : '/products'
  return apiFetch<ProductResponse>(path)
}

export async function fetchProductById(id: number) {
  return apiFetch<ProductDto>(`/products/${id}`)
}

export async function fetchAvailabilityBySku(sku: string) {
  return apiFetch<ProductDto>(`/products/sku/${encodeURIComponent(sku)}/availability`)
}

export function createProduct(payload: ProductCreateRequest) {
  return apiFetch<ProductDto>('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
  })
}

export function updateProduct(id: number, payload: ProductUpdateRequest) {
  return apiFetch<ProductDto>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
  })
}

export function deleteProduct(id: number) {
  return apiFetch<void>(`/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}
