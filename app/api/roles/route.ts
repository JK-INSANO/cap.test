import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/server/jwt'
import { ejecutarBotCreacionRol } from '@/lib/server/services/sap-bot'
import { ApiResponse } from '@/lib/types'

const CreacionRolSchema = z.object({
  rolPorCrear: z.string().min(1, 'El nombre del rol es requerido'),
  transacciones: z.string().nullable().optional(),
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

    if (session.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Acceso denegado. Se requiere rol de administrador.' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const validationResult = CreacionRolSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { rolPorCrear, transacciones } = validationResult.data

    const sapResult = await ejecutarBotCreacionRol({
      rolPorCrear,
      transacciones: transacciones ?? null,
    })

    if (!sapResult.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: sapResult.error || 'Error al conectar con SAP iRPA' },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      jobUid: sapResult.jobUid,
      message: `Rol "${rolPorCrear}" enviado a SAP iRPA exitosamente`,
    })
  } catch (error) {
    console.error('Creacion rol error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
