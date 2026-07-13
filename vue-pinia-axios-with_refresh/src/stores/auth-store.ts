import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient, {
  fetchMe,
  refreshAccessToken,
  setAccessToken,
} from '../api/api-client'
import authConfig from '../configs/auth-config'
import type {
  ErrorCallback,
  LoginCallback,
  LoginParams,
  LoginResponse,
  RegisterCallback,
  RegisterParams,
} from '../types/auth-types'
import type { User } from '../types/user-types'
import { getAccessToken } from '../utils/access-token-storage'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(true)

  function setUser(value: User | null): void {
    user.value = value
  }

  function setLoading(value: boolean): void {
    loading.value = value
  }

  function login(
    params: LoginParams,
    resolveCallback?: LoginCallback,
    errorCallback?: ErrorCallback
  ): void {
    apiClient
      .post<LoginResponse>(authConfig.loginEndpoint, {
        email: params.email.trim(),
        password: params.password,
      })
      .then((response) => {
        const { accessToken, user: loggedInUser } = response.data

        setAccessToken(accessToken)
        user.value = loggedInUser
        token.value = accessToken

        if (resolveCallback) resolveCallback(response)
      })
      .catch((error) => {
        if (errorCallback) errorCallback(error)
      })
  }

  async function logout(): Promise<void> {
    try {
      await apiClient.post(authConfig.logoutEndpoint)
    } catch {
      // logout is idempotent; clear local state even if request fails
    } finally {
      setAccessToken(null)
      user.value = null
      token.value = null
    }
  }

  function register(
    params: RegisterParams,
    resolveCallback?: RegisterCallback,
    errorCallback?: ErrorCallback
  ): void {
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

  async function initAuth(): Promise<void> {
    loading.value = true

    const storedAccess = getAccessToken()
    if (storedAccess) {
      setAccessToken(storedAccess)
    }

    const loadUser = async (): Promise<boolean> => {
      try {
        const currentUser = await fetchMe<User>()
        user.value = currentUser
        token.value = getAccessToken()
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
      user.value = null
      token.value = null
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    setUser,
    setLoading,
    login,
    logout,
    register,
    initAuth,
  }
})
