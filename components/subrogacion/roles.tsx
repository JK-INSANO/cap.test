'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ErrorAlert } from '@/components/ui/error-alert'
import { Loader2, CheckCircle2, UserCog, ShieldPlus } from 'lucide-react'

export function RoleManagement() {
  const [assignForm, setAssignForm] = useState({ rut: '', rol: '' })
  const [assignError, setAssignError] = useState('')
  const [assignSuccess, setAssignSuccess] = useState('')
  const [assignLoading, setAssignLoading] = useState(false)

  const [createForm, setCreateForm] = useState({ nombre: '', transacciones: '' })
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [createLoading, setCreateLoading] = useState(false)

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    setAssignError('')
    setAssignSuccess('')
    setAssignLoading(true)
    try {
      const res = await fetch('/api/roles/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut: assignForm.rut, rol: assignForm.rol }),
      })
      const data = await res.json()
      if (data.success) {
        setAssignSuccess(`Rol "${assignForm.rol}" asignado al RUT ${assignForm.rut} correctamente.`)
        setAssignForm({ rut: '', rol: '' })
      } else {
        setAssignError(data.error || 'Error al asignar el rol.')
      }
    } catch {
      setAssignError('Error de conexión con el servidor.')
    } finally {
      setAssignLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError('')
    setCreateSuccess('')
    setCreateLoading(true)
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rolPorCrear: createForm.nombre,
          transacciones: createForm.transacciones || null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setCreateSuccess(`Rol "${createForm.nombre}" enviado a SAP iRPA exitosamente.`)
        setCreateForm({ nombre: '', transacciones: '' })
      } else {
        setCreateError(data.error || 'Error al crear el rol.')
      }
    } catch {
      setCreateError('Error de conexión con el servidor.')
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Asignar rol a usuario */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cmp-blue/10">
              <UserCog className="h-5 w-5 text-cmp-blue" />
            </div>
            <div>
              <CardTitle className="text-xl">Asignar Rol</CardTitle>
              <CardDescription>Asigne un rol a un usuario existente</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAssign} className="space-y-5">
            <ErrorAlert message={assignError} />

            {assignSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">{assignSuccess}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="assign-rut">RUT de usuario</Label>
              <Input
                id="assign-rut"
                type="text"
                placeholder="12.345.678-9"
                value={assignForm.rut}
                onChange={(e) => setAssignForm((prev) => ({ ...prev, rut: e.target.value }))}
                required
                disabled={assignLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assign-rol">Rol para asignar</Label>
              <Input
                id="assign-rol"
                type="text"
                placeholder="Nombre del rol"
                value={assignForm.rol}
                onChange={(e) => setAssignForm((prev) => ({ ...prev, rol: e.target.value }))}
                required
                disabled={assignLoading}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                className="bg-cmp-blue hover:bg-cmp-blue-dark px-8"
                disabled={assignLoading}
              >
                {assignLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Asignando...
                  </>
                ) : (
                  'Asignar Rol'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Crear nuevo rol */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cmp-blue/10">
              <ShieldPlus className="h-5 w-5 text-cmp-blue" />
            </div>
            <div>
              <CardTitle className="text-xl">Crear Rol</CardTitle>
              <CardDescription>Defina un nuevo rol con sus transacciones</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-5">
            <ErrorAlert message={createError} />

            {createSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">{createSuccess}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="create-nombre">Nombre del rol</Label>
              <Input
                id="create-nombre"
                type="text"
                placeholder="Ej: Supervisor de turno"
                value={createForm.nombre}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, nombre: e.target.value }))}
                required
                disabled={createLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-transacciones">Transacciones del rol</Label>
              <Textarea
                id="create-transacciones"
                placeholder={"Ingrese una transacción por línea:\nTX_001\nTX_002\nTX_003"}
                value={createForm.transacciones}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, transacciones: e.target.value }))}
                required
                disabled={createLoading}
                className="resize-none overflow-y-auto"
                style={{ height: 'calc(10 * 1.5rem + 1rem)', maxHeight: 'calc(10 * 1.5rem + 1rem)' }}
              />
              <p className="text-xs text-muted-foreground">
                Ingrese una transacción por línea. Puede agregar tantas como necesite.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                className="bg-cmp-blue hover:bg-cmp-blue-dark px-8"
                disabled={createLoading}
              >
                {createLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando rol...
                  </>
                ) : (
                  'Crear Rol'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
