import type { Router } from 'vue-router'
import { getAuthState } from '../composables/use-auth'

export function setupAuthGuards(router: Router): void {
  router.beforeEach((to, _from, next) => {
    const { user } = getAuthState()

    if (to.meta.requiresAuth && !user.value) {
      next({
        path: '/login',
        query: { returnUrl: to.fullPath },
      })
      return
    }

    if (to.meta.guestOnly && user.value) {
      next({ path: '/' })
      return
    }

    next()
  })
}
