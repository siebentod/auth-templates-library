import type { Pinia } from 'pinia'
import type { Router } from 'vue-router'
import { useAuthStore } from '../stores/auth-store'

export function setupAuthGuards(router: Router, pinia: Pinia): void {
  router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore(pinia)

    if (to.meta.requiresAuth && !authStore.user) {
      next({
        path: '/login',
        query: { returnUrl: to.fullPath },
      })
      return
    }

    if (to.meta.guestOnly && authStore.user) {
      next({ path: '/' })
      return
    }

    next()
  })
}
