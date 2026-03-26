import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/server/jwt'
import { prisma } from '@/lib/server/prisma'
import { ejecutarBotSubrogacion } from '@/lib/server/services/sap-bot'
import { ApiResponse } from '@/lib/types'
import { parseDateFromDots } from '@/lib/date-utils'

const SubrogacionSchema = z.object({
  rutUsuarioSubrogado: z
    .string()
    .min(1, 'El RUT del usuario subrogado es requerido')
    .regex(/^[0-9]+-[0-9kK]$/, 'Formato de RUT inválido (ej: 12345678-9)'),
  rutUsuarioSubrogante: z
    .string()
    .min(1, 'El RUT del usuario subrogante es requerido')
    .regex(/^[0-9]+-[0-9kK]$/, 'Formato de RUT inválido (ej: 12345678-9)'),
  fechaInicio: z
    .string()
    .min(1, 'La fecha de inicio es requerida')
    .regex(/^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$/, 'Formato de fecha inválido (DD.MM.YYYY)'),
  fechaFin: z
    .string()
    .min(1, 'La fecha de fin es requerida')
    .regex(/^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$/, 'Formato de fecha inválido (DD.MM.YYYY)'),
})

export async function POST(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No autorizado. Debe iniciar sesión.' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validación con Zod
    const validationResult = SubrogacionSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { rutUsuarioSubrogado, rutUsuarioSubrogante, fechaInicio, fechaFin } = validationResult.data

    const fechaInicioDate = parseDateFromDots(fechaInicio)
    const fechaFinDate = parseDateFromDots(fechaFin)

    if (fechaInicioDate >= fechaFinDate) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'La fecha de inicio debe ser anterior a la fecha de fin' },
        { status: 400 }
      )
    }

    if (rutUsuarioSubrogado === rutUsuarioSubrogante) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'El usuario subrogado y subrogante no pueden ser el mismo' },
        { status: 400 }
      )
    }

    const newSubrogacion = await prisma.subrogacion.create({
      data: {
        rutUsuarioSubrogado,
        rutUsuarioSubrogante,
        fechaInicio: fechaInicioDate,
        fechaFin: fechaFinDate,
        createdBy: session.userId,
      }
    })

    // Disparar el Bot de SAP en segundo plano (o esperado)
    const sapResult = await ejecutarBotSubrogacion({
      rutUsuarioSubrogado,
      rutUsuarioSubrogante,
      fechaInicio,
      fechaFin
    })

    if (sapResult && !sapResult.success) {
      return NextResponse.json(
        { success: false, error: sapResult.error || 'Error al conectar con SAP iRPA' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: newSubrogacion,
      jobUid: sapResult?.jobUid,
      message: 'Subrogación creada y bot de SAP iniciado exitosamente',
    })
  } catch (error) {
    console.error('Subrogacion error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No autorizado. Debe iniciar sesión.' },
        { status: 401 }
      )
    }

    const subrogaciones = await prisma.subrogacion.findMany({
      where: {
        createdBy: session.userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: subrogaciones,
    })
  } catch (error) {
    console.error('Get subrogaciones error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
