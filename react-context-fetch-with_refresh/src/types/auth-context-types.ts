import type { User } from './user-types'

export type LoginParams = {
  email: string
  password: string
}

export type RegisterParams = {
  username: string
  email: string
  password: string
}

export type LoginResponse = {
  accessToken: string
  user: User
}

export type RefreshResponse = {
  accessToken: string
}

export type AuthContextValue = {
  user: User | null
  token: string | null
  loading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  login: (
    params: LoginParams,
    resolveCallback?: (data: LoginResponse) => void,
    errorCallback?: (error: unknown) => void
  ) => void
  logout: () => Promise<void>
  register: (
    params: RegisterParams,
    resolveCallback?: (data: User) => void,
    errorCallback?: (error: unknown) => void
  ) => void
}
