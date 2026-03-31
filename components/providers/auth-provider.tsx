'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { login as loginApi, logout as logoutApi, getSession } from '@/lib/api/auth'
import { SessionUser } from '@/lib/types'

interface AuthContextType {
  user: SessionUser | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const session = await getSession()

      if (session.success && session.data) {
        setUser(session.data)
      }
    } catch (error) {
      console.error('Session check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    try {
      const result = await loginApi({ username, password })

      if (result.success && result.data) {
        setUser(result.data)
        return { success: true }
      }

      return { success: false, error: result.error || 'Error al iniciar sesión' }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: 'Error de conexión' }
    }
  }

  const logout = async () => {
    try {
      await logoutApi()
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

