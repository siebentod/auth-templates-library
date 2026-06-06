import { createRouter, createWebHistory } from 'vue-router'
import Home from './home.vue'
import Login from './login.vue'
import Registration from './registration.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: Login,
      meta: { guestOnly: true },
    },
    {
      path: '/registration',
      component: Registration,
      meta: { guestOnly: true },
    },
    {
      path: '/',
      component: Home,
      meta: { requiresAuth: true },
    },
  ],
})

export default router
