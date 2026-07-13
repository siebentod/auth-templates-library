import authConfig from '../configs/auth-config'
import { ApiError, type ApiResponse } from '../types/api-types'
import type { RefreshResponse } from '../types/auth-context-types'
import {
  removeAccessTokenStorage,
  setAccessTokenStorage,
} from '../utils/access-token-storage'

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  _retry?: boolean
}

type QueueEntry = {
  resolve: () => void
  reject: (error: unknown) => void
}

let accessTokenHeader: string | null = null
let isRefreshing = false
let failedQueue: QueueEntry[] = []

const authExemptPaths = [
  authConfig.loginEndpoint,
  authConfig.registerEndpoint,
  authConfig.refreshEndpoint,
]

function isAuthExemptUrl(url: string): boolean {
  return authExemptPaths.some(
    (path) => url === path || url.endsWith(path)
  )
}

function buildUrl(path: string): string {
  const base = authConfig.apiBaseUrl.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

function getDefaultHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    [authConfig.xhrHeaderName]: authConfig.xhrHeaderValue,
  }

  if (accessTokenHeader) {
    headers.Authorization = `Bearer ${accessTokenHeader}`
  }

  return headers
}

function mergeHeaders(customHeaders?: HeadersInit): Headers {
  const headers = new Headers(getDefaultHeaders())

  if (customHeaders) {
    new Headers(customHeaders).forEach((value, key) => {
      headers.set(key, value)
    })
  }

  return headers
}

async function parseResponseBody<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  if (!text) {
    return undefined as T
  }

  return JSON.parse(text) as T
}

function processQueue(error: unknown | null = null): void {
  failedQueue.forEach((entry) => {
    if (error) {
      entry.reject(error)
      return
    }

    entry.resolve()
  })

  failedQueue = []
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { body, _retry, headers: customHeaders, ...rest } = options

  const headers = mergeHeaders(customHeaders)

  let requestBody: BodyInit | undefined
  if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
    requestBody = JSON.stringify(body)
  }

  const response = await fetch(buildUrl(path), {
    ...rest,
    credentials: 'include',
    headers,
    body: requestBody,
  })

  if (!response.ok) {
    let errorBody: unknown

    try {
      errorBody = await response.json()
    } catch {
      // ignore non-json error body
    }

    const error = new ApiError(response.status, errorBody)

    if (response.status === 401 && !_retry && !isAuthExemptUrl(path)) {
      if (isRefreshing) {
        return new Promise<ApiResponse<T>>((resolve, reject) => {
          failedQueue.push({
            resolve: () => {
              resolve(request<T>(path, { ...options, _retry: true }))
            },
            reject,
          })
        })
      }

      isRefreshing = true

      try {
        await refreshAccessToken()
        processQueue()
        return request<T>(path, { ...options, _retry: true })
      } catch (refreshError) {
        processQueue(refreshError)
        setAccessToken(null)
        throw refreshError
      } finally {
        isRefreshing = false
      }
    }

    throw error
  }

  const data = await parseResponseBody<T>(response)

  return { data, status: response.status }
}

export function setAccessToken(token: string | null): void {
  if (token) {
    setAccessTokenStorage(token)
    accessTokenHeader = token
    return
  }

  removeAccessTokenStorage()
  accessTokenHeader = null
}

export async function refreshAccessToken(): Promise<string> {
  const response = await request<RefreshResponse>(
    authConfig.refreshEndpoint,
    { method: 'POST' }
  )
  const { accessToken } = response.data

  setAccessToken(accessToken)

  return accessToken
}

export async function fetchMe<T = unknown>(): Promise<T> {
  const response = await request<T>(authConfig.meEndpoint, { method: 'GET' })
  return response.data
}

const apiClient = {
  get<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(path, { ...options, method: 'GET' })
  },

  post<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) {
    return request<T>(path, { ...options, method: 'POST', body })
  },

  patch<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) {
    return request<T>(path, { ...options, method: 'PATCH', body })
  },

  delete<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(path, { ...options, method: 'DELETE' })
  },
}

export default apiClient
