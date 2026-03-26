import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const TOKEN_NAME = 'cmp-auth-token'

/** Rutas protegidas que requieren autenticación */
const PROTECTED_ROUTES = ['/api/subrogacion']

/** Rutas públicas de autenticación (no requieren token) */
const PUBLIC_AUTH_ROUTES = ['/api/auth/login', '/api/auth/logout']

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  // Solo interceptar rutas de API protegidas
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Verificar token JWT
  const token = request.cookies.get(TOKEN_NAME)?.value

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'No autorizado. Debe iniciar sesión.' },
      { status: 401 }
    )
  }

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET no configurado')
    }

    const jwtSecret = new TextEncoder().encode(secret)
    await jwtVerify(token, jwtSecret)

    return NextResponse.next()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Sesión expirada. Inicie sesión nuevamente.' },
      { status: 401 }
    )
  }
}

export const config = {
  matcher: ['/api/subrogacion/:path*'],
}

