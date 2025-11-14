import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import { CatalogPage } from '../features/catalog/CatalogPage'
import { CartPage } from '../features/cart/CartPage'
import { OrdersPage } from '../features/orders/OrdersPage'
import { PaymentsPage } from '../features/payments/PaymentsPage'
import { AuthPage } from '../features/auth/AuthPage'
import { AdminPage } from '../features/admin/AdminPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'auth', element: <AuthPage /> },
      { path: 'admin', element: <AdminPage /> },
    ],
  },
])
