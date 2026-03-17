import { NextResponse } from 'next/server'
import { getSession } from '@/lib/backend/lib/jwt'
import { PrismaClient } from '@prisma/client'
import { ejecutarBotSubrogacion } from '@/lib/backend/services/sap-bot'
import { SubrogacionRequest, ApiResponse } from '@/lib/backend/types'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No autorizado. Debe iniciar sesión.' },
        { status: 401 }
      )
    }

    const body: SubrogacionRequest = await request.json()
    const { rutUsuarioSubrogado, rutUsuarioSubrogante, fechaInicio, fechaFin } = body

    // Validaciones
    if (!rutUsuarioSubrogado || !rutUsuarioSubrogante || !fechaInicio || !fechaFin) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Convertir de formato DD.MM.YYYY (SAP) a un objeto Date válido para Prisma
    const parseDateFromDots = (dateStr: string) => {
      const [day, month, year] = dateStr.split('.')
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    }

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

export async function GET() {
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
