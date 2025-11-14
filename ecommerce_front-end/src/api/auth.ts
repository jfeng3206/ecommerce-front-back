import { apiFetch } from './http'
import type { Role } from '../lib/roles'

export type LoginDto = {
  email: string
  password: string
}

export type JWTAuthResponse = {
  token: string
  tokenType: string
}

export type AddressDto = {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export type UserDto = {
  id?: number
  name: string
  email: string
  password: string
  addresses?: AddressDto[]
  role?: Role
}

export async function signIn(credentials: LoginDto) {
  return apiFetch<JWTAuthResponse>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export async function registerUser(payload: UserDto) {
  return apiFetch<UserDto>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function logoutUser(token: string) {
  return apiFetch<string>('/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
