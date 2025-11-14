const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY

type Token = string | null

export const tokenStorage = {
  get(): Token {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  },
  set(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
  },
}
