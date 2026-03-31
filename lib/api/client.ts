import { ApiResponse } from '@/lib/types'

type Extra = Record<string, unknown>

interface ApiOptions extends RequestInit {}

function withJsonHeaders(init: ApiOptions): ApiOptions {
  const headers = new Headers(init.headers ?? {})
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return { ...init, headers }
}

export async function apiFetch<T, X extends Extra = Extra>(
  input: string,
  init: ApiOptions = {}
): Promise<ApiResponse<T> & X> {
  const response = await fetch(input, withJsonHeaders(init))

  let json: Partial<ApiResponse<T>> & X = {} as Partial<ApiResponse<T>> & X
  try {
    json = await response.json()
  } catch {
    // ignore parse errors; json stays empty
  }

  const success = response.ok && json.success === true
  if (!success) {
    return {
      ...(json as ApiResponse<T> & X),
      success: false,
      error: json.error ?? `HTTP ${response.status}`,
    }
  }

  return {
    ...(json as ApiResponse<T> & X),
    success: true,
  }
}
