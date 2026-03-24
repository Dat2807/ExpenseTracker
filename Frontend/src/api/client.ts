const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string
}

export class ApiError extends Error {
  code?: string
  errors?: Record<string, string[]>

  constructor(message: string, code?: string, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.errors = errors
  }
}

export function getApiErrorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    const detailValues = err.errors ? Object.values(err.errors).flat() : []
    if (detailValues.length > 0) {
      return detailValues[0]
    }
    return err.message || fallback
  }

  if (err instanceof Error) {
    return err.message
  }

  return fallback
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (options.token) {
    headers.Authorization = `Token ${options.token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.message ?? 'Request failed'
    throw new ApiError(message, data?.code, data?.errors)
  }

  return data as T
}

