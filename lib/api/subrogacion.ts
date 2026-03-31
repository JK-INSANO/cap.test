import { apiFetch } from '@/lib/api/client'
import { Subrogacion, SubrogacionRequest } from '@/lib/types'

interface CreateSubrogacionExtras {
  jobUid?: string
}

export function createSubrogacion(payload: SubrogacionRequest) {
  return apiFetch<Subrogacion, CreateSubrogacionExtras>('/api/subrogacion', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function listSubrogaciones(page: number = 1) {
  const url = `/api/subrogacion?page=${page}`
  return apiFetch<Subrogacion[]>(url)
}
