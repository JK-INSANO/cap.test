import { NextResponse } from 'next/server'
import { getSession } from '@/lib/backend/lib/jwt'
import { db } from '@/lib/backend/lib/db'
import { SubrogacionRequest, ApiResponse } from '@/lib/backend/types'

// Validar formato de RUT chileno
function isValidRut(rut: string): boolean {
  const rutPattern = /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$/
  return rutPattern.test(rut)
}

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

    if (!isValidRut(rutUsuarioSubrogado)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Formato de RUT Usuario Subrogado inválido. Use formato: XX.XXX.XXX-X' },
        { status: 400 }
      )
    }

    if (!isValidRut(rutUsuarioSubrogante)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Formato de RUT Usuario Subrogante inválido. Use formato: XX.XXX.XXX-X' },
        { status: 400 }
      )
    }

    const fechaInicioDate = new Date(fechaInicio)
    const fechaFinDate = new Date(fechaFin)

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

    const newSubrogacion = db.subrogaciones.create({
      rutUsuarioSubrogado,
      rutUsuarioSubrogante,
      fechaInicio,
      fechaFin,
      createdBy: session.userId,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: newSubrogacion,
      message: 'Subrogación creada exitosamente',
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

    const subrogaciones = db.subrogaciones.findByCreator(session.userId)

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
