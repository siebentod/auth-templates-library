import type { AxiosResponse } from 'axios'
import type { Ref } from 'vue'
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

export type AuthState = {
  user: Ref<User | null>
  token: Ref<string | null>
  loading: Ref<boolean>
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  login: (
    params: LoginParams,
    resolveCallback?: (response: AxiosResponse<LoginResponse>) => void,
    errorCallback?: (error: unknown) => void
  ) => void
  logout: () => Promise<void>
  register: (
    params: RegisterParams,
    resolveCallback?: (response: AxiosResponse<User>) => void,
    errorCallback?: (error: unknown) => void
  ) => void
}
