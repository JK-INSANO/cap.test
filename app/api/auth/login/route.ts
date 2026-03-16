import { NextResponse } from 'next/server'
import { signToken, setSessionCookie } from '@/backend/lib/jwt'
import { db } from '@/backend/lib/db'
import { LoginRequest, ApiResponse } from '@/backend/types'

export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const user = db.users.findByUsername(username)

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    const isValidPassword = await db.users.validatePassword(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    const token = await signToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    })

    await setSessionCookie(token)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        userId: user.id,
        username: user.username,
        email: user.email,
      },
      message: 'Inicio de sesión exitoso',
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
