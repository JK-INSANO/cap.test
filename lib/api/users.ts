import { apiFetch } from '@/lib/api/client'
import { UserCreateRequest, UserListItem } from '@/lib/types'

export function createUser(payload: UserCreateRequest) {
  return apiFetch<UserListItem>('/api/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function listUsers(page: number = 1, role?: 'USER' | 'ADMIN') {
  const params = new URLSearchParams({ page: String(page) })
  if (role) params.set('role', role)
  return apiFetch<UserListItem[]>(`/api/users?${params.toString()}`)
}
