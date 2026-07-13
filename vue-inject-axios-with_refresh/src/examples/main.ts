import { createApp } from 'vue'
import { initAuth } from '../composables/use-auth'
import { createAuthPlugin } from '../plugins/auth-plugin'
import { setupAuthGuards } from '../router/auth-guards'
import App from './app.vue'
import router from './router'

const app = createApp(App)

app.use(createAuthPlugin())
await initAuth()
app.use(router)
setupAuthGuards(router)

app.mount('#app')
