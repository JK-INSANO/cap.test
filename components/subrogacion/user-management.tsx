'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ErrorAlert } from '@/components/ui/error-alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, CheckCircle2, UserPlus, Shield } from 'lucide-react'
import { formatISOToDisplay } from '@/lib/date-utils'
import { TablePaginationControls } from '@/components/ui/table-pagination'
import { createUser, listUsers } from '@/lib/api/users'

interface UserInfo {
  id: string
  username: string
  email: string
  role: 'USER' | 'ADMIN'
  createdAt: string
}

export function UserManagement() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'USER' as 'USER' | 'ADMIN',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<UserInfo[]>([])
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL')
  const [usersPage, setUsersPage] = useState(1)
  const [usersTotal, setUsersTotal] = useState(0)
  const [usersTotalPages, setUsersTotalPages] = useState(1)

  const fetchUsers = async (page: number = 1, role: 'ALL' | 'USER' | 'ADMIN' = roleFilter) => {
    try {
      const data = await listUsers(page, role === 'ALL' ? undefined : role)
      if (data.success && data.data) {
        setUsers(data.data)
        setUsersTotal(data.meta?.total ?? 0)
        setUsersTotalPages(data.meta?.totalPages ?? 1)
        setUsersPage(page)
      }
    } catch (err) {
      console.error('Fetch users error:', err)
    }
  }

  useEffect(() => {
    fetchUsers(1)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const data = await createUser(formData)

      if (data.success && data.data) {
        setSuccess(`Usuario "${data.data.username}" creado exitosamente.`)
        setFormData({ username: '', email: '', password: '', role: 'USER' })
        fetchUsers(1, roleFilter)
      } else {
        setError(data.error || 'Error al crear usuario')
      }
    } catch (err) {
      console.error('Create user error:', err)
      setError('Error de conexión con el servidor')
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cmp-blue/10">
              <UserPlus className="h-5 w-5 text-cmp-blue" />
            </div>
            <div>
              <CardTitle className="text-xl">Crear Usuario</CardTitle>
              <CardDescription>Registre nuevos usuarios en el sistema</CardDescription>
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
                <Label htmlFor="new-username">Nombre de usuario</Label>
                <Input
                  id="new-username"
                  type="text"
                  placeholder="nombre_usuario"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  required
                  disabled={isLoading}
                  minLength={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="usuario@cmp.cl"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-role">Rol</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'USER' | 'ADMIN') => setFormData(prev => ({ ...prev, role: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger id="new-role">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Usuario</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="bg-cmp-blue hover:bg-cmp-blue-dark px-8"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando usuario...
                  </>
                ) : (
                  'Crear Usuario'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Usuarios Registrados
            </CardTitle>
            <Select
              value={roleFilter}
              onValueChange={(value: 'ALL' | 'USER' | 'ADMIN') => { setRoleFilter(value); fetchUsers(1, value) }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los roles</SelectItem>
                <SelectItem value="USER">Usuario</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay usuarios registrados</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">Usuario</th>
                      <th className="text-left py-3 px-2 font-medium">Email</th>
                      <th className="text-left py-3 px-2 font-medium">Rol</th>
                      <th className="text-left py-3 px-2 font-medium">Creado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b last:border-0">
                        <td className="py-3 px-2">{u.username}</td>
                        <td className="py-3 px-2">{u.email}</td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.role === 'ADMIN'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {u.role === 'ADMIN' ? 'Admin' : 'Usuario'}
                          </span>
                        </td>
                        <td className="py-3 px-2">{formatISOToDisplay(String(u.createdAt))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TablePaginationControls
                total={usersTotal}
                currentPage={usersPage}
                totalPages={usersTotalPages}
                onPageChange={(p) => fetchUsers(p)}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
