import { apiFetch } from './http'
import type { Role } from '../lib/roles'
import { tokenStorage } from '../lib/tokenStorage'

export type UserProfile = {
  id: number
  name: string
  email: string
  role: Role
}

export type UserPage = {
  content: UserProfile[]
  pageNo: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

function authHeaders(tokenOverride?: string): Record<string, string> | undefined {
  const token = tokenOverride ?? tokenStorage.get()
  if (!token) return undefined
  return { Authorization: `Bearer ${token}` }
}

export async function fetchCurrentUser(token: string) {
  return apiFetch<UserProfile>('/users/me', {
    headers: authHeaders(token),
  })
}

export async function fetchUsers(params?: { pageNo?: number; pageSize?: number; search?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.pageNo !== undefined) searchParams.set('pageNo', params.pageNo.toString())
  if (params?.pageSize !== undefined) searchParams.set('pageSize', params.pageSize.toString())
  if (params?.search) searchParams.set('search', params.search)
  const qs = searchParams.toString()
  const path = qs ? `/users?${qs}` : '/users'
  return apiFetch<UserPage>(path, {
    headers: authHeaders(),
  })
}

export async function updateUser(id: number, payload: Partial<UserProfile>) {
  return apiFetch<UserProfile>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
  })
}

export async function deleteUser(id: number) {
  return apiFetch<void>(`/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}
