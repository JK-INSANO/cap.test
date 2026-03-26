export interface User {
  id: string
  username: string
  email: string
  password: string
}

export interface Subrogacion {
  id: string
  rutUsuarioSubrogado: string
  rutUsuarioSubrogante: string
  fechaInicio: string
  fechaFin: string
  createdAt: string
  createdBy: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface SubrogacionRequest {
  rutUsuarioSubrogado: string
  rutUsuarioSubrogante: string
  fechaInicio: string
  fechaFin: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

