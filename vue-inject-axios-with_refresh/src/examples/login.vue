<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/use-auth'

const auth = useAuth()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref<string | null>(null)

const handleSubmit = () => {
  error.value = null

  auth.login(
    { email: email.value, password: password.value },
    () => {
      const returnUrl =
        typeof route.query.returnUrl === 'string'
          ? route.query.returnUrl
          : '/'
      router.push(returnUrl)
    },
    () => {
      error.value = 'Неверный email или пароль'
    }
  )
}
</script>

<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
        >
      </div>
      <div>
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
        >
      </div>
      <p v-if="error">
        {{ error }}
      </p>
      <button type="submit">
        Войти
      </button>
    </form>
    <p>
      <RouterLink to="/registration">
        Регистрация
      </RouterLink>
    </p>
  </div>
</template>
