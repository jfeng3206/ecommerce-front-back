export type Role = 'USER' | 'ADMIN' | 'PAYMENT_ADMIN' | 'SERVICE_ORDER'

export function isAdminRole(role?: Role | null) {
  return role === 'ADMIN' || role === 'SERVICE_ORDER'
}

export function canManagePayments(role?: Role | null) {
  return role === 'ADMIN' || role === 'PAYMENT_ADMIN' || role === 'SERVICE_ORDER'
}
