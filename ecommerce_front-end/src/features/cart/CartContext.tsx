import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import type { ProductDto } from '../../api/products'
import { useAuth } from '../auth/AuthContext'

export type CartItem = {
  productId: number
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

export type CartState = {
  items: Record<number, CartItem>
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: ProductDto; quantity?: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: number; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: number } }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; payload: CartState }

const initialState: CartState = {
  items: {},
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity = 1 } = action.payload
      const existing = state.items[product.id]
      const nextQuantity = (existing?.quantity ?? 0) + quantity
      return {
        items: {
          ...state.items,
          [product.id]: {
            productId: product.id,
            name: product.name,
            price: Number(product.price),
            quantity: nextQuantity,
            imageUrl: product.imageUrl,
          },
        },
      }
    }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        const copy = { ...state.items }
        delete copy[action.payload.productId]
        return { items: copy }
      }
      const existing = state.items[action.payload.productId]
      if (!existing) return state
      return {
        items: {
          ...state.items,
          [action.payload.productId]: {
            ...existing,
            quantity: action.payload.quantity,
          },
        },
      }
    }
    case 'REMOVE_ITEM': {
      const copy = { ...state.items }
      delete copy[action.payload.productId]
      return { items: copy }
    }
    case 'CLEAR':
      return initialState
    case 'HYDRATE':
      return action.payload
    default:
      return state
  }
}

const CartContext = createContext<{
  state: CartState
  addItem: (product: ProductDto, quantity?: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  removeItem: (productId: number) => void
  clear: () => void
} | null>(null)

const STORAGE_PREFIX = 'ecomm.cart.v2'
const LEGACY_STORAGE_KEY = 'ecomm.cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const storageKey = `${STORAGE_PREFIX}:${token ?? 'guest'}`

  const [state, dispatch] = useReducer(cartReducer, initialState, () => readCart(storageKey))

  useEffect(() => {
    dispatch({ type: 'HYDRATE', payload: readCart(storageKey) })
  }, [storageKey])

  useEffect(() => {
    persistCart(storageKey, state)
  }, [state, storageKey])

  const value = useMemo(
    () => ({
      state,
      addItem: (product: ProductDto, quantity?: number) =>
        dispatch({ type: 'ADD_ITEM', payload: { product, quantity } }),
      updateQuantity: (productId: number, quantity: number) =>
        dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } }),
      removeItem: (productId: number) =>
        dispatch({ type: 'REMOVE_ITEM', payload: { productId } }),
      clear: () => dispatch({ type: 'CLEAR' }),
    }),
    [state],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

function readCart(key: string): CartState {
  if (typeof window === 'undefined') return initialState
  try {
    const stored = window.localStorage.getItem(key)
    if (stored) {
      return parseCart(stored)
    }
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacy) {
      const legacyCart = parseCart(legacy)
      window.localStorage.removeItem(LEGACY_STORAGE_KEY)
      window.localStorage.setItem(key, JSON.stringify(legacyCart))
      return legacyCart
    }
  } catch {
    // ignore invalid JSON
  }
  return initialState
}

function persistCart(key: string, state: CartState) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(state))
  } catch {
    // ignore quota errors
  }
}

function parseCart(payload: string): CartState {
  try {
    const parsed = JSON.parse(payload)
    if (parsed && typeof parsed === 'object' && 'items' in parsed) {
      return {
        items:
          parsed.items && typeof parsed.items === 'object'
            ? (parsed.items as CartState['items'])
            : {},
      }
    }
  } catch {
    // ignore invalid JSON
  }
  return initialState
}
