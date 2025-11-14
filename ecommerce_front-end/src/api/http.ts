const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function buildUrl(path: string) {
  const cleanBase = API_BASE_URL?.replace(/\/$/, '') ?? ''
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${cleanBase}${cleanPath}`
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const raw = await response.text()
    const extracted = normalizeMessage(extractErrorMessage(raw))
    const fallback = describeStatus(response.status, response.statusText)
    throw new Error(extracted || fallback)
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T
  }

  const text = await response.text()
  return text as unknown as T
}

function extractErrorMessage(raw: string) {
  if (!raw) return ''
  const trimmed = raw.trim()
  const direct = parseJsonString(trimmed)
  if (direct) {
    return direct
  }

  const embedded = parseEmbeddedJson(trimmed)
  if (embedded) {
    return embedded
  }

  const messageMatch = trimmed.match(/"message"\s*:\s*"([^"]+)"/)
  if (messageMatch) {
    return messageMatch[1]
  }

  const feignPayloadIndex = trimmed.indexOf(']:')
  if (feignPayloadIndex !== -1) {
    const remainder = trimmed.slice(feignPayloadIndex + 2).trim()
    const parsedRemainder = parseJsonString(remainder) ?? parseEmbeddedJson(remainder)
    if (parsedRemainder) {
      return parsedRemainder
    }
  }

  return trimmed
}

function normalizeMessage(value: string) {
  if (!value) return ''
  const trimmed = value.trim()
  if (trimmed === '[]' || trimmed === '{}' || trimmed === 'null') {
    return ''
  }
  return trimmed
}

function describeStatus(status: number, statusText?: string | null) {
  const table: Record<number, string> = {
    400: 'Bad request. Please review the form and try again.',
    401: 'Not authorized. Please sign in again.',
    403: 'You do not have permission to perform this action.',
    404: 'Not found. Please refresh and try again.',
    409: 'Request conflict. Please retry.',
    422: 'Validation failed. Please review the inputs.',
    500: 'Server error. Please try again later.',
  }
  return table[status] || statusText || `Request failed (HTTP ${status})`
}

function parseJsonString(value: string) {
  try {
    const parsed = JSON.parse(value)
    return pickMessage(parsed)
  } catch {
    return null
  }
}

function parseEmbeddedJson(value: string) {
  const patterns = ['[{', '["', '[', '{']
  const indices: number[] = []

  for (const pattern of patterns) {
    const idx = value.indexOf(pattern)
    if (idx !== -1 && !indices.includes(idx)) {
      indices.push(idx)
    }
  }

  indices.sort((a, b) => a - b)

  for (const idx of indices) {
    const candidate = value.slice(idx)
    const parsed = parseJsonString(candidate)
    if (parsed) {
      return parsed
    }
  }

  return null
}

function pickMessage(payload: unknown): string | null {
  if (payload == null) return null
  if (typeof payload === 'string') return payload
  if (Array.isArray(payload)) {
    for (const entry of payload) {
      const message = pickMessage(entry)
      if (message) return message
    }
    return JSON.stringify(payload)
  }
  if (typeof payload === 'object') {
    const maybeMessage = (payload as Record<string, unknown>).message
    if (typeof maybeMessage === 'string') return maybeMessage
    const maybeError = (payload as Record<string, unknown>).error
    if (typeof maybeError === 'string') return maybeError
    return JSON.stringify(payload)
  }
  return String(payload)
}
