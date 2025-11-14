import { apiFetch } from './http'
import { tokenStorage } from '../lib/tokenStorage'

export type OrderItemDto = {
  id: number
  productId: number
  productName: string
  unitPrice: number
  quantity: number
  totalPrice: number
}

export type OrderStatusUpdate = {
  status: string
  changedAt: string
  description?: string
  actor?: string
}

export type FulfillmentNote = {
  id?: string | number
  note: string
  createdAt?: string
  recordedBy?: string
}

export type OrderResponse = {
  orderId: string
  userId: number
  totalAmount: number
  orderStatus: string
  createdAt: string
  updatedAt: string
  items: OrderItemDto[]
  skippedSkus?: string[]
  hasBackorderedItems: boolean
  statusHistory?: OrderStatusUpdate[]
  fulfillmentNotes?: FulfillmentNote[]
}

export type OrderAllResponse = {
  content: OrderResponse[]
  pageNo: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

export type OrderItemAdjustment = {
  productId: number
  quantity?: number
  remove?: boolean
}

export type PaymentMethodDto = {
  type: string
  instrumentId?: string
  providerReference?: string
  last4?: string
  cardholderName?: string
}

export type OrderCreateRequest = {
  items: OrderItemAdjustment[]
  currency: string
  paymentMethod: PaymentMethodDto
}

export type OrderUpdateRequest = {
  removeProductIds?: number[]
  adjustItems?: OrderItemAdjustment[]
  currentStatus?: string
}

function authHeaders(): Record<string, string> | undefined {
  const token = tokenStorage.get()
  if (!token) return undefined
  return { Authorization: `Bearer ${token}` }
}

export async function fetchMyOrders() {
  return apiFetch<OrderResponse[]>('/orders/mine', {
    headers: authHeaders(),
  })
}

export async function fetchOrders(params?: {
  pageNo?: number
  pageSize?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}) {
  const searchParams = new URLSearchParams()
  if (params?.pageNo !== undefined) searchParams.set('pageNo', params.pageNo.toString())
  if (params?.pageSize !== undefined) searchParams.set('pageSize', params.pageSize.toString())
  if (params?.sortBy) searchParams.set('sortBy', params.sortBy)
  if (params?.sortDir) searchParams.set('sortDir', params.sortDir)
  const path = searchParams.toString() ? `/orders?${searchParams}` : '/orders'
  return apiFetch<OrderAllResponse>(path, {
    headers: authHeaders(),
  })
}

export function fetchOrderById(id: string) {
  return apiFetch<OrderResponse>(`/orders/${id}`, {
    headers: authHeaders(),
  })
}

export function createOrder(payload: OrderCreateRequest) {
  return apiFetch<OrderResponse>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
  })
}

export function updateOrder(id: string, payload: OrderUpdateRequest) {
  return apiFetch<OrderResponse>(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
  })
}

export function cancelOrder(id: string) {
  return apiFetch<string>(`/orders/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}
