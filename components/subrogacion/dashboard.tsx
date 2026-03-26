'use client'

import { Header } from './header'
import { SubrogacionForm } from './subrogacion-form'

export function Dashboard() {
  return (
    <div className="min-h-screen bg-secondary/30">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SubrogacionForm />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Compañía Minera del Pacífico S.A. - Sistema de Subrogación</p>
      </footer>
    </div>
  )
}

