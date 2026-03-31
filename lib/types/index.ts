export type Role = 'USER' | 'ADMIN'

export interface SessionUser {
  userId: string
  username: string
  email: string
  role: Role
}

export interface User {
  id: string
  username: string
  email: string
  password: string
  role: Role
}

export interface UserListItem {
  id: string
  username: string
  email: string
  role: Role
  createdAt: string
}

export interface Subrogacion {
  id: string
  rutUsuarioSubrogado: string
  rutUsuarioSubrogante: string
  fechaInicio: string
  fechaFin: string
  createdAt: string
  createdBy: string
  authorUsername?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface UserCreateRequest {
  username: string
  email: string
  password: string
  role: Role
}

export interface SubrogacionRequest {
  rutUsuarioSubrogado: string
  rutUsuarioSubrogante: string
  fechaInicio: string
  fechaFin: string
}

export interface PaginationMeta {
  total: number
  page: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
  meta?: PaginationMeta
}

