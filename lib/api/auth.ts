import { apiFetch } from '@/lib/api/client'
import { LoginRequest, SessionUser, ApiResponse } from '@/lib/types'

export function login(payload: LoginRequest) {
  return apiFetch<SessionUser>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function logout() {
  return apiFetch<unknown>('/api/auth/logout', {
    method: 'POST',
  })
}

export function getSession() {
  return apiFetch<SessionUser>('/api/auth/session')
}
