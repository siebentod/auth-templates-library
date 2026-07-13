import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import authConfig from '../configs/auth-config'
import type { RefreshResponse } from '../types/auth-types'
import {
  removeAccessTokenStorage,
  setAccessTokenStorage,
} from '../utils/access-token-storage'

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

type QueueEntry = {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

const apiClient = axios.create({
  baseURL: authConfig.apiBaseUrl,
  withCredentials: true,
  headers: {
    [authConfig.xhrHeaderName]: authConfig.xhrHeaderValue,
  },
})

let isRefreshing = false
let failedQueue: QueueEntry[] = []

const authExemptPaths = [
  authConfig.loginEndpoint,
  authConfig.registerEndpoint,
  authConfig.refreshEndpoint,
]

function isAuthExemptUrl(url?: string): boolean {
  if (!url) return false

  return authExemptPaths.some(
    (path) => url === path || url.endsWith(path)
  )
}

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach((entry) => {
    if (error) {
      entry.reject(error)
      return
    }

    if (token) {
      entry.resolve(token)
    }
  })

  failedQueue = []
}

export function setAccessToken(token: string | null): void {
  if (token) {
    setAccessTokenStorage(token)
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  removeAccessTokenStorage()
  delete apiClient.defaults.headers.common.Authorization
}

export async function refreshAccessToken(): Promise<string> {
  const response = await apiClient.post<RefreshResponse>(
    authConfig.refreshEndpoint
  )
  const { accessToken } = response.data

  setAccessToken(accessToken)

  return accessToken
}

export async function fetchMe<T = unknown>(): Promise<T> {
  const response = await apiClient.get<T>(authConfig.meEndpoint)
  return response.data
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthExemptUrl(originalRequest.url)
    ) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(originalRequest))
          },
          reject,
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const accessToken = await refreshAccessToken()
      processQueue(null, accessToken)
      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      setAccessToken(null)
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default apiClient
