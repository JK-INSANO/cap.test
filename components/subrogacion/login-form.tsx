'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorAlert } from '@/components/ui/error-alert'
import { Loader2, User, Lock } from 'lucide-react'

export function LoginForm() {
  const { login } = useAuth()
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await login(username, password)

    if (!result.success) {
      setError(result.error || 'Error al iniciar sesión')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cmp-blue">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/logo-cmp.png"
            alt="CMP Logo"
            width={200}
            height={80}
            className="h-20 w-auto object-contain"
            priority
          />
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-semibold text-foreground">
              Sistema de Subrogación
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Ingrese sus credenciales para acceder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <ErrorAlert message={error} />

              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">Usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ingrese su usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-6 bg-cmp-blue hover:bg-cmp-blue-dark"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 pt-4 border-t text-center">
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm mt-6 text-white/70">
          Compañía Minera del Pacífico S.A.
        </p>
      </div>
    </div>
  )
}

