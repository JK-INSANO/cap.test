import { User, Subrogacion } from '../types'
import bcrypt from 'bcryptjs'

// Generar hashes de contraseñas al iniciar
const adminPasswordHash = bcrypt.hashSync('admin123', 10)
const userPasswordHash = bcrypt.hashSync('user123', 10)

// Mock database - En producción usar una base de datos real
const users: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@cmp.cl',
    password: adminPasswordHash,
  },
  {
    id: '2',
    username: 'usuario',
    email: 'usuario@cmp.cl',
    password: userPasswordHash,
  },
]

const subrogaciones: Subrogacion[] = []

export const db = {
  users: {
    findByUsername: (username: string): User | undefined => {
      return users.find(u => u.username === username)
    },
    findById: (id: string): User | undefined => {
      return users.find(u => u.id === id)
    },
    validatePassword: async (password: string, hash: string): Promise<boolean> => {
      return bcrypt.compare(password, hash)
    },
  },
  subrogaciones: {
    create: (data: Omit<Subrogacion, 'id' | 'createdAt'>): Subrogacion => {
      const newSubrogacion: Subrogacion = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      subrogaciones.push(newSubrogacion)
      return newSubrogacion
    },
    findAll: (): Subrogacion[] => {
      return [...subrogaciones]
    },
    findByCreator: (userId: string): Subrogacion[] => {
      return subrogaciones.filter(s => s.createdBy === userId)
    },
  },
}
