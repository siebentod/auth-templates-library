export type Role = 'admin' | 'user'

export type User = {
  id: string
  username: string
  email: string
  role: Role
  isActive: boolean
  createdAt: string
  updatedAt: string
}
