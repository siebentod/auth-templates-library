import type { AxiosResponse } from 'axios'
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

export type LoginCallback = (response: AxiosResponse<LoginResponse>) => void
export type RegisterCallback = (response: AxiosResponse<User>) => void
export type ErrorCallback = (error: unknown) => void
