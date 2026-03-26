import { NextResponse } from 'next/server'
import { getSession } from '@/lib/server/jwt'
import { ApiResponse } from '@/lib/types'

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        userId: session.userId,
        username: session.username,
        email: session.email,
      },
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error al verificar sesión' },
      { status: 500 }
    )
  }
}
