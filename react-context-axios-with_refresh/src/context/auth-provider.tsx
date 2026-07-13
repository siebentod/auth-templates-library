import type { AxiosResponse } from 'axios'
import { useEffect, useState, type ReactNode } from 'react'
import apiClient, {
  fetchMe,
  refreshAccessToken,
  setAccessToken,
} from '../api/api-client'
import authConfig from '../configs/auth-config'
import type {
  LoginParams,
  LoginResponse,
  RegisterParams,
} from '../types/auth-context-types'
import type { User } from '../types/user-types'
import { getAccessToken } from '../utils/access-token-storage'
import { AuthContext } from './auth-context'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)

      const storedAccess = getAccessToken()
      if (storedAccess) {
        setAccessToken(storedAccess)
      }

      const loadUser = async (): Promise<boolean> => {
        try {
          const currentUser = await fetchMe<User>()
          setUser(currentUser)
          setToken(getAccessToken())
          return true
        } catch {
          return false
        }
      }

      try {
        if (storedAccess) {
          const loaded = await loadUser()
          if (loaded) return

          try {
            await refreshAccessToken()
            if (await loadUser()) return
          } catch {
            // fall through to clear session
          }
        } else {
          try {
            await refreshAccessToken()
            if (await loadUser()) return
          } catch {
            // guest
          }
        }

        setAccessToken(null)
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    void initAuth()
  }, [])

  const handleLogin = (
    params: LoginParams,
    resolveCallback?: (response: AxiosResponse<LoginResponse>) => void,
    errorCallback?: (error: unknown) => void
  ) => {
    apiClient
      .post<LoginResponse>(authConfig.loginEndpoint, {
        email: params.email.trim(),
        password: params.password,
      })
      .then((response) => {
        const { accessToken, user: loggedInUser } = response.data

        setAccessToken(accessToken)
        setUser(loggedInUser)
        setToken(accessToken)

        if (resolveCallback) resolveCallback(response)
      })
      .catch((error) => {
        if (errorCallback) errorCallback(error)
      })
  }

  const handleLogout = async () => {
    try {
      await apiClient.post(authConfig.logoutEndpoint)
    } catch {
      // logout is idempotent; clear local state even if request fails
    } finally {
      setAccessToken(null)
      setUser(null)
      setToken(null)
    }
  }

  const handleRegister = (
    params: RegisterParams,
    resolveCallback?: (response: AxiosResponse<User>) => void,
    errorCallback?: (error: unknown) => void
  ) => {
    apiClient
      .post<User>(authConfig.registerEndpoint, {
        username: params.username.trim(),
        email: params.email.trim(),
        password: params.password,
      })
      .then((response) => {
        if (resolveCallback) resolveCallback(response)
      })
      .catch((error) => {
        if (errorCallback) errorCallback(error)
      })
  }

  const value = {
    user,
    token,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
