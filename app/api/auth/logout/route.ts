import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/backend/lib/jwt'
import { ApiResponse } from '@/backend/types'

export async function POST() {
  try {
    await clearSessionCookie()
    
    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Sesión cerrada exitosamente',
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error al cerrar sesión' },
      { status: 500 }
    )
  }
}
