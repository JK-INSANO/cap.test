'use client'

import Image from 'next/image'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { LogOut, User, Users, FileText } from 'lucide-react'

export type Page = 'subrogacion' | 'users'

interface HeaderProps {
  currentPage?: Page
  onNavigate?: (page: Page) => void
}

export function Header({ currentPage = 'subrogacion', onNavigate }: HeaderProps) {
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  return (
    <header className="text-primary-foreground shadow-lg bg-cmp-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Image
              src="/images/logo-cmp.png"
              alt="CMP Logo"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold">Sistema de Subrogación</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Navegación */}
            {isAdmin && onNavigate && (
              <nav className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('subrogacion')}
                  className={`text-primary-foreground hover:bg-[#1e5bb8] hover:text-primary-foreground ${
                    currentPage === 'subrogacion' ? 'bg-[#1e5bb8]' : ''
                  }`}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Subrogación</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('users')}
                  className={`text-primary-foreground hover:bg-[#1e5bb8] hover:text-primary-foreground ${
                    currentPage === 'users' ? 'bg-[#1e5bb8]' : ''
                  }`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Usuarios</span>
                </Button>
              </nav>
            )}

            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{user?.username}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-primary-foreground hover:bg-[#1e5bb8] hover:text-primary-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

