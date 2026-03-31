import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/server/jwt'
import { prisma } from '@/lib/server/prisma'
import { ApiResponse } from '@/lib/types'
import bcrypt from 'bcryptjs'

const CreateUserSchema = z.object({
  username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['USER', 'ADMIN'], { message: 'Rol inválido' }),
})

/** Solo admins pueden crear usuarios */
export async function POST(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSession()

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No autorizado. Se requiere rol de administrador.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validationResult = CreateUserSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { username, email, password, role } = validationResult.data

    // Verificar si ya existe
    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    })

    if (existing) {
      const field = existing.username === username ? 'nombre de usuario' : 'email'
      return NextResponse.json<ApiResponse>(
        { success: false, error: `Ya existe un usuario con ese ${field}.` },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: { username, email, password: hashedPassword, role },
      select: { id: true, username: true, email: true, role: true, createdAt: true },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: newUser,
      message: 'Usuario creado exitosamente',
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/** Solo admins pueden listar usuarios */
export async function GET(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSession()

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No autorizado. Se requiere rol de administrador.' },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'))
    const pageSize = 10
    const roleParam = url.searchParams.get('role')

    // Filtro de rol server-side
    const where = roleParam && (roleParam === 'USER' || roleParam === 'ADMIN')
      ? { role: roleParam as 'USER' | 'ADMIN' }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, username: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json<ApiResponse>({
      success: true,
      data: users,
      meta: { total, page, totalPages: Math.ceil(total / pageSize) },
    })
  } catch (error) {
    console.error('List users error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

