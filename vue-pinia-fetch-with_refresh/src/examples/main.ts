import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { setupAuthGuards } from '../router/auth-guards'
import { useAuthStore } from '../stores/auth-store'
import App from './app.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const authStore = useAuthStore(pinia)
await authStore.initAuth()

app.use(router)
setupAuthGuards(router, pinia)

app.mount('#app')
