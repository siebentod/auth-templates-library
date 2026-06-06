import { createContext } from 'react'
import type { AuthContextValue } from '../types/auth-context-types'

const defaultProvider: AuthContextValue = {
  user: null,
  token: null,
  loading: true,
  setUser: () => null,
  setLoading: () => undefined,
  login: () => undefined,
  logout: () => Promise.resolve(),
  register: () => undefined,
}

export const AuthContext = createContext<AuthContextValue>(defaultProvider)
