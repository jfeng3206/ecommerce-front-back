import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { LoginDto, UserDto } from '../../api/auth'

const defaultRegisterState: UserDto = {
  name: '',
  email: '',
  password: '',
  role: 'USER',
}

type BannerTone = 'info' | 'success' | 'error'

export function AuthPage() {
  const { login, register, logout, token, status } = useAuth()
  const navigate = useNavigate()
  const [loginForm, setLoginForm] = useState<LoginDto>({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState<UserDto>(defaultRegisterState)
  const [showRegister, setShowRegister] = useState(false)
  const [banner, setBanner] = useState<{ text: string; tone: BannerTone } | null>(null)

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBanner(null)
    try {
      await login(loginForm)
      setBanner({ text: 'Signed in successfully. Token stored locally.', tone: 'success' })
      navigate('/', { replace: true })
    } catch (err) {
      setBanner({ text: normalizeError(err, 'Login failed'), tone: 'error' })
    }
  }

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBanner(null)
    try {
      await register(registerForm)
      setBanner({ text: 'Registration complete. You can now sign in.', tone: 'success' })
      setRegisterForm(defaultRegisterState)
    } catch (err) {
      setBanner({ text: normalizeError(err, 'Registration failed'), tone: 'error' })
    }
  }

  const handleLogout = async () => {
    setBanner(null)
    await logout()
    setBanner({ text: 'Token cleared. You are logged out locally.', tone: 'info' })
  }

  const bannerStyles = useMemo(
    () => ({
      info: 'border-slate-200 bg-slate-50 text-slate-700',
      success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      error: 'border-red-200 bg-red-50 text-red-700',
    }),
    [],
  )

  return (
    <section className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Authentication
        </p>
        <h1 className="text-3xl font-semibold text-brand">Welcome</h1>
        <p className="text-sm text-slate-600">
          Sign in or register a new user here.
        </p>
      </header>

      {banner && (
        <div
          className={`rounded-xl border p-4 text-sm ${bannerStyles[banner.tone]}`}
        >
          {banner.text}
        </div>
      )}

      <div className="space-y-4">
        {!showRegister && (
          <form
            onSubmit={handleLogin}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div>
              <h2 className="text-lg font-semibold">Sign in</h2>
              <p className="text-sm text-slate-500">Use an existing account from the backend.</p>
            </div>
            <label className="block text-sm font-medium text-slate-600">
              Email
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-slate-600">
              Password
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-full bg-brand px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Signing in…' : 'Sign in'}
            </button>
            <p className="text-center text-xs text-slate-500">
              Need an account?{' '}
              <button
                type="button"
                className="font-semibold text-brand underline"
                onClick={() => setShowRegister(true)}
              >
                Register a new user
              </button>
            </p>
          </form>
        )}

        {showRegister && (
          <form
            onSubmit={handleRegister}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Register</h2>
                <p className="text-sm text-slate-500">Create a lightweight user record for testing.</p>
              </div>
              <button
                type="button"
                className="text-xs font-semibold uppercase tracking-wide text-brand underline"
                onClick={() => setShowRegister(false)}
              >
                Back to sign in
              </button>
            </div>
            <label className="block text-sm font-medium text-slate-600">
              Name
              <input
                type="text"
                required
                value={registerForm.name}
                onChange={(event) => setRegisterForm({ ...registerForm, name: event.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-slate-600">
              Email
              <input
                type="email"
                required
                value={registerForm.email}
                onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-slate-600">
              Password
              <input
                type="password"
                required
                value={registerForm.password}
                onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-full bg-brand px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Submitting…' : 'Register'}
            </button>
          </form>
        )}
      </div>

      {token && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-700">
              You are signed in. Use the button to log out.
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

function normalizeError(error: unknown, fallback: string) {
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message)
      if (typeof parsed === 'string') return parsed
      if (parsed && typeof parsed === 'object' && typeof parsed.message === 'string') {
        return parsed.message
      }
    } catch {
      // ignore JSON parse issues
    }
    return error.message || fallback
  }
  return fallback
}
