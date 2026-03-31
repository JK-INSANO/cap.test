'use client'

import { useState } from 'react'
import { Header, Page } from './header'
import { SubrogacionForm } from './subrogacion-form'
import { UserManagement } from './user-management'
import { useAuth } from '@/components/providers/auth-provider'

export function Dashboard() {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>('subrogacion')
  const isAdmin = user?.role === 'ADMIN'

  return (
    <div className="min-h-screen bg-secondary/30">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'subrogacion' && <SubrogacionForm />}
        {currentPage === 'users' && isAdmin && <UserManagement />}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Compañía Minera del Pacífico S.A. - Sistema de Subrogación</p>
      </footer>
    </div>
  )
}

