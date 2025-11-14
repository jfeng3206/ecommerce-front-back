import { NavLink, Outlet } from 'react-router-dom'
import { Bars3Icon } from '@heroicons/react/24/outline'
import { useAuth } from './features/auth/AuthContext'
import { canManagePayments, isAdminRole } from './lib/roles'

const navItems = [
  { to: '/', label: 'Catalog' },
  { to: '/cart', label: 'Cart' },
  { to: '/orders', label: 'Orders' },
  { to: '/payments', label: 'Payments', paymentOnly: true },
  { to: '/admin', label: 'Admin', adminOnly: true },
  { to: '/auth', label: 'Auth' },
]

function App() {
  const { role } = useAuth()
  const isAdmin = isAdminRole(role)
  const canPayments = canManagePayments(role)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/80 text-white">
              <Bars3Icon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                ecommerce
              </p>
              <p className="text-lg font-semibold text-brand">Welcome</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm font-medium">
            {navItems.map((item) => {
              if (item.adminOnly && !isAdmin) return null
              if (item.paymentOnly && !canPayments) return null
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'rounded-full px-4 py-2 transition',
                      isActive
                        ? 'bg-brand text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                    ].join(' ')
                  }
                  end={item.to === '/'}
                >
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}

export default App
