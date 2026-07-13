import authConfig from '../configs/auth-config'

export function getAccessToken(): string | null {
  return localStorage.getItem(authConfig.storageAccessTokenKey)
}

export function setAccessTokenStorage(token: string): void {
  localStorage.setItem(authConfig.storageAccessTokenKey, token)
}

export function removeAccessTokenStorage(): void {
  localStorage.removeItem(authConfig.storageAccessTokenKey)
}
