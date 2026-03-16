'use client'

import { AuthProvider, useAuth } from '@/frontend/context/auth-context'
import { LoginForm } from '@/frontend/components/login-form'
import { Dashboard } from '@/frontend/components/dashboard'
import { Loader2 } from 'lucide-react'

function AppContent() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#2D72D9' }}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-foreground mx-auto mb-4" />
          <p className="text-primary-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return <Dashboard />
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
