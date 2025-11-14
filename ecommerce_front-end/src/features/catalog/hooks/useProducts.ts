import { useEffect, useState } from 'react'
import { fetchProducts, type ProductResponse } from '../../../api/products'
import { getFallbackCatalog } from '../data/fallbackCatalog'

export function useProducts(pageNo = 0, pageSize = 9, search?: string) {
  const [data, setData] = useState<ProductResponse | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setStatus('loading')
    setError(null)

    fetchProducts({ pageNo, pageSize, search })
      .then((response) => {
        if (!active) return
        setData(response)
        setStatus('success')
      })
      .catch((err) => {
        if (!active) return
        const fallback = getFallbackCatalog(pageNo, pageSize)
        if (fallback) {
          console.warn('Falling back to sample catalog data:', err)
          setData(fallback)
          setStatus('success')
          setError(null)
          return
        }
        setError(err instanceof Error ? err.message : 'Unable to load products')
        setStatus('error')
      })

    return () => {
      active = false
    }
  }, [pageNo, pageSize, search])

  return { data, status, error }
}
