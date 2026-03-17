'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, FileText, Calendar, Users } from 'lucide-react'

interface SubrogacionData {
  id: string
  rutUsuarioSubrogado: string
  rutUsuarioSubrogante: string
  fechaInicio: string
  fechaFin: string
  createdAt: string
}

export function SubrogacionForm() {
  const [formData, setFormData] = useState({
    rutUsuarioSubrogado: '',
    rutUsuarioSubrogante: '',
    fechaInicio: '',
    fechaFin: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [subrogaciones, setSubrogaciones] = useState<SubrogacionData[]>([])
  const [showHistory, setShowHistory] = useState(false)

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
      // Formatear RUT: quitar puntos para el bot
      const cleanRutSubrogado = formData.rutUsuarioSubrogado.replace(/\./g, '')
      const cleanRutSubrogante = formData.rutUsuarioSubrogante.replace(/\./g, '')

      // Formatear Fechas: de YYYY-MM-DD a DD.MM.YYYY para SAP
      const formatDateToDots = (dateStr: string) => {
        if (!dateStr) return ''
        const [year, month, day] = dateStr.split('-')
        return `${day}.${month}.${year}`
      }

      // Llamada a nuestra API interna (esto protege las llaves de SAP)
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

  const fetchSubrogaciones = async () => {
    try {
      const response = await fetch('/api/subrogacion')
      const data = await response.json()
      if (data.success) setSubrogaciones(data.data)
    } catch (err) {
      console.error('Fetch error:', err)
    }
  }

  const handleShowHistory = () => {
    if (!showHistory) fetchSubrogaciones()
    setShowHistory(!showHistory)
  }

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(45, 114, 217, 0.1)' }}>
              <FileText className="h-5 w-5" style={{ color: '#2D72D9' }} />
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
            {error && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                <AlertDescription className="text-destructive">{error}</AlertDescription>
              </Alert>
            )}

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
                className="flex-1"
                style={{ backgroundColor: '#2D72D9' }}
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
            {subrogaciones.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay registros</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">Subrogado</th>
                      <th className="text-left py-3 px-2 font-medium">Subrogante</th>
                      <th className="text-left py-3 px-2 font-medium">Inicio</th>
                      <th className="text-left py-3 px-2 font-medium">Fin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subrogaciones.map((sub) => (
                      <tr key={sub.id} className="border-b last:border-0">
                        <td className="py-3 px-2">{sub.rutUsuarioSubrogado}</td>
                        <td className="py-3 px-2">{sub.rutUsuarioSubrogante}</td>
                        <td className="py-3 px-2">{sub.fechaInicio}</td>
                        <td className="py-3 px-2">{sub.fechaFin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}