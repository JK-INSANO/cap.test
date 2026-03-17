import { NextResponse } from 'next/server'
import { z } from 'zod'
import { signToken, setSessionCookie } from '@/lib/backend/lib/jwt'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { LoginRequest, ApiResponse } from '@/lib/backend/types'

const prisma = new PrismaClient()

const LoginSchema = z.object({
  username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json()
    
    // Validación con Zod
    const validationResult = LoginSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { username, password } = validationResult.data

    const user = await prisma.user.findUnique({ where: { username } })

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

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
