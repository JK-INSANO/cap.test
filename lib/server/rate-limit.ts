

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

// Limpiar entradas expiradas cada 5 minutos
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 5 * 60 * 1000)

interface RateLimitConfig {
  /** Máximo de intentos permitidos en la ventana de tiempo */
  maxAttempts: number
  /** Ventana de tiempo en milisegundos */
  windowMs: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetInMs: number
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { maxAttempts: 5, windowMs: 15 * 60 * 1000 }
): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  // Si no hay entrada o la ventana expiró, crear nueva
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetInMs: config.windowMs,
    }
  }

  // Incrementar contador
  entry.count++

  if (entry.count > config.maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: entry.resetTime - now,
    }
  }

  return {
    allowed: true,
    remaining: config.maxAttempts - entry.count,
    resetInMs: entry.resetTime - now,
  }
}

