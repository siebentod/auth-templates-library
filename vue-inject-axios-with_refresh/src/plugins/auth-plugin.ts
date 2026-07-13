import type { App } from 'vue'
import { authInjectionKey, createAuthState } from '../composables/use-auth'

export function createAuthPlugin() {
  return {
    install(app: App) {
      app.provide(authInjectionKey, createAuthState())
    },
  }
}
