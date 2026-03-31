'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ErrorAlert } from '@/components/ui/error-alert'
import { Loader2, CheckCircle2, FileText, Calendar, Users } from 'lucide-react'
import { Subrogacion } from '@/lib/types'
import { formatDateToDots, formatISOToDisplay } from '@/lib/date-utils'
import { useAuth } from '@/components/providers/auth-provider'
import { TablePaginationControls } from '@/components/ui/table-pagination'

export function SubrogacionForm() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  interface SubrogacionFormData {
    rutUsuarioSubrogado: string
    rutUsuarioSubrogante: string
    fechaInicio: string
    fechaFin: string
  }

  const [formData, setFormData] = useState<SubrogacionFormData>({
    rutUsuarioSubrogado: '',
    rutUsuarioSubrogante: '',
    fechaInicio: '',
    fechaFin: '',
  })
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [subrogaciones, setSubrogaciones] = useState<Subrogacion[]>([])
  const [showHistory, setShowHistory] = useState<boolean>(false)
  const [historyPage, setHistoryPage] = useState(1)
  const [historyLoading, setHistoryLoading] = useState<boolean>(false)
  const [historyTotal, setHistoryTotal] = useState<number>(0)
  const [historyTotalPages, setHistoryTotalPages] = useState<number>(1)

  const formatRut = (value: string) => {
    let rut = value.replace(/[^0-9kK]/g, '')
    if (rut.length > 1) {
      const dv = rut.slice(-1)
      const numbers = rut.slice(0, -1)
      let formatted = ''
      let count = 0
      for (let i = numbers.length - 1; i >= 0; i--) {
        formatted = numbers[i] + formatted
        count++
        if (count === 3 && i !== 0) {
          formatted = '.' + formatted
          count = 0
        }
      }
      return formatted + '-' + dv.toUpperCase()
    }
    return rut
  }

  const handleRutChange = (field: 'rutUsuarioSubrogado' | 'rutUsuarioSubrogante', value: string) => {
    const formatted = formatRut(value)
    setFormData(prev => ({ ...prev, [field]: formatted }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const cleanRutSubrogado = formData.rutUsuarioSubrogado.replace(/\./g, '')
      const cleanRutSubrogante = formData.rutUsuarioSubrogante.replace(/\./g, '')

      const response = await fetch('/api/subrogacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rutUsuarioSubrogado: cleanRutSubrogado,
          rutUsuarioSubrogante: cleanRutSubrogante,
          fechaInicio: formatDateToDots(formData.fechaInicio),
          fechaFin: formatDateToDots(formData.fechaFin),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(`Subrogación registrada. Job ID: ${data.jobUid}`)
        setFormData({
          rutUsuarioSubrogado: '',
          rutUsuarioSubrogante: '',
          fechaInicio: '',
          fechaFin: '',
        })
        fetchSubrogaciones()
      } else {
        setError(data.error || 'Error al conectar con SAP iRPA')
      }
    } catch (err) {
      console.error('Submit error:', err)
      setError('Error de conexión con el servidor')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSubrogaciones = useCallback(async (page: number = 1) => {
    setHistoryLoading(true)
    try {
      const response = await fetch(`/api/subrogacion?page=${page}`)
      const data = await response.json()
      if (data.success) {
        setSubrogaciones(data.data)
        setHistoryTotal(data.meta?.total ?? 0)
        setHistoryTotalPages(data.meta?.totalPages ?? 1)
        setHistoryPage(page)
      }
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  const handleShowHistory = () => {
    if (!showHistory) {
      setSubrogaciones([])
      setHistoryTotal(0)
      fetchSubrogaciones(1)
    }
    setShowHistory(!showHistory)
    setHistoryPage(1)
  }

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cmp-blue/10">
              <FileText className="h-5 w-5 text-cmp-blue" />
            </div>
            <div>
              <CardTitle className="text-xl">Registro de Subrogación</CardTitle>
              <CardDescription>
                Complete el formulario para activar el bot de subrogación en SAP
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <ErrorAlert message={error} />

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="rutSubrogado" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  RUT Usuario Subrogado
                </Label>
                <Input
                  id="rutSubrogado"
                  type="text"
                  placeholder="12.345.678-9"
                  value={formData.rutUsuarioSubrogado}
                  onChange={(e) => handleRutChange('rutUsuarioSubrogado', e.target.value)}
                  maxLength={12}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rutSubrogante" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  RUT Usuario Subrogante
                </Label>
                <Input
                  id="rutSubrogante"
                  type="text"
                  placeholder="12.345.678-9"
                  value={formData.rutUsuarioSubrogante}
                  onChange={(e) => handleRutChange('rutUsuarioSubrogante', e.target.value)}
                  maxLength={12}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaInicio" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Fecha de Inicio
                </Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData(prev => ({ ...prev, fechaInicio: e.target.value }))}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaFin" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Fecha de Fin
                </Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={formData.fechaFin}
                  onChange={(e) => setFormData(prev => ({ ...prev, fechaFin: e.target.value }))}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-cmp-blue hover:bg-cmp-blue-dark"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ejecutando Bot en SAP...
                  </>
                ) : (
                  'Registrar Subrogación'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleShowHistory}
              >
                {showHistory ? 'Ocultar Historial' : 'Ver Historial'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {showHistory && (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Historial Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--cmp-blue)]" />
                <span className="ml-2 text-sm text-muted-foreground">Cargando historial...</span>
              </div>
            ) : subrogaciones.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay registros</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">Subrogado</th>
                        <th className="text-left py-3 px-2 font-medium">Subrogante</th>
                        <th className="text-left py-3 px-2 font-medium">Inicio</th>
                        <th className="text-left py-3 px-2 font-medium">Fin</th>
                        {isAdmin && <th className="text-left py-3 px-2 font-medium">Registrado por</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {subrogaciones.map((sub) => (
                        <tr key={sub.id} className="border-b last:border-0">
                          <td className="py-3 px-2">{sub.rutUsuarioSubrogado}</td>
                          <td className="py-3 px-2">{sub.rutUsuarioSubrogante}</td>
                          <td className="py-3 px-2">{formatISOToDisplay(String(sub.fechaInicio))}</td>
                          <td className="py-3 px-2">{formatISOToDisplay(String(sub.fechaFin))}</td>
                          {isAdmin && <td className="py-3 px-2">{sub.authorUsername ?? '—'}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <TablePaginationControls
                  total={historyTotal}
                  currentPage={historyPage}
                  totalPages={historyTotalPages}
                  onPageChange={(p) => fetchSubrogaciones(p)}
                />
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

