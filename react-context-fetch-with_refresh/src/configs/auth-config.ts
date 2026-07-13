const authConfig = {
  apiBaseUrl: '/api',
  loginEndpoint: '/auth/login',
  logoutEndpoint: '/auth/logout',
  registerEndpoint: '/auth/register',
  refreshEndpoint: '/auth/refresh',
  meEndpoint: '/auth/me',
  storageAccessTokenKey: 'accessToken',
  xhrHeaderName: 'X-Requested-With',
  xhrHeaderValue: 'XMLHttpRequest',
} as const

export default authConfig
