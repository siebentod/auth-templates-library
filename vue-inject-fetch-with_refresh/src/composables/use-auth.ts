import { inject, ref, type InjectionKey } from 'vue'
import apiClient, {
  fetchMe,
  refreshAccessToken,
  setAccessToken,
} from '../api/api-client'
import authConfig from '../configs/auth-config'
import type {
  AuthState,
  LoginParams,
  LoginResponse,
  RegisterParams,
} from '../types/auth-types'
import type { User } from '../types/user-types'
import { getAccessToken } from '../utils/access-token-storage'

const user = ref<User | null>(null)
const token = ref<string | null>(null)
const loading = ref(true)

export const authInjectionKey: InjectionKey<AuthState> = Symbol('auth')

function handleLogin(
  params: LoginParams,
  resolveCallback?: (data: LoginResponse) => void,
  errorCallback?: (error: unknown) => void
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

      if (resolveCallback) resolveCallback(response.data)
    })
    .catch((error) => {
      if (errorCallback) errorCallback(error)
    })
}

async function handleLogout(): Promise<void> {
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

function handleRegister(
  params: RegisterParams,
  resolveCallback?: (data: User) => void,
  errorCallback?: (error: unknown) => void
): void {
  apiClient
    .post<User>(authConfig.registerEndpoint, {
      username: params.username.trim(),
      email: params.email.trim(),
      password: params.password,
    })
    .then((response) => {
      if (resolveCallback) resolveCallback(response.data)
    })
    .catch((error) => {
      if (errorCallback) errorCallback(error)
    })
}

export function createAuthState(): AuthState {
  return {
    user,
    token,
    loading,
    setUser: (value) => {
      user.value = value
    },
    setLoading: (value) => {
      loading.value = value
    },
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
  }
}

export function useAuth(): AuthState {
  const auth = inject(authInjectionKey)

  if (!auth) {
    throw new Error('useAuth() must be used after app.use(createAuthPlugin())')
  }

  return auth
}

export function getAuthState(): Pick<AuthState, 'user' | 'token' | 'loading'> {
  return { user, token, loading }
}

export async function initAuth(): Promise<void> {
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
