import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/server/jwt'
import { ApiResponse } from '@/lib/types'

export async function POST(): Promise<NextResponse<ApiResponse>> {
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
