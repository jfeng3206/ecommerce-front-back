import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { signIn, registerUser, logoutUser, type LoginDto, type UserDto } from '../../api/auth'
import { fetchCurrentUser } from '../../api/users'
import { tokenStorage } from '../../lib/tokenStorage'
import type { Role } from '../../lib/roles'

export type AuthStatus = 'idle' | 'loading' | 'error' | 'success'

export type AuthContextValue = {
  token: string | null
  role: Role | null
  status: AuthStatus
  error: string | null
  login: (credentials: LoginDto) => Promise<void>
  register: (payload: UserDto) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => tokenStorage.get())
  const [role, setRole] = useState<Role | null>(null)
  const [status, setStatus] = useState<AuthStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (credentials: LoginDto) => {
    setStatus('loading')
    setError(null)
    try {
      const response = await signIn(credentials)
      tokenStorage.set(response.token)
      setToken(response.token)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Unable to sign in')
      throw err
    }
  }, [])

  const register = useCallback(async (payload: UserDto) => {
    setStatus('loading')
    setError(null)
    try {
      await registerUser(payload)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Unable to register')
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    if (!token) return
    setStatus('loading')
    setError(null)
    try {
      await logoutUser(token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to logout')
    } finally {
      tokenStorage.clear()
      setToken(null)
      setRole(null)
      setStatus('idle')
    }
  }, [token])

  useEffect(() => {
    let cancelled = false
    if (!token) {
      setRole(null)
      return
    }
    ;(async () => {
      try {
        const profile = await fetchCurrentUser(token)
        if (!cancelled) {
          setRole(profile.role ?? null)
        }
      } catch (err) {
        if (!cancelled) {
          setRole(null)
        }
        console.warn('Failed to load user profile', err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  const value = useMemo(
    () => ({ token, role, status, error, login, register, logout }),
    [token, role, status, error, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
