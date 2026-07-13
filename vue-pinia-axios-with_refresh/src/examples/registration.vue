<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth-store'

const authStore = useAuthStore()
const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')
const error = ref<string | null>(null)

const handleSubmit = () => {
  error.value = null

  authStore.register(
    {
      username: username.value,
      email: email.value,
      password: password.value,
    },
    () => {
      router.push('/login')
    },
    () => {
      error.value = 'Не удалось зарегистрироваться'
    }
  )
}
</script>

<template>
  <div>
    <h1>Registration</h1>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="username">Username</label>
        <input
          id="username"
          v-model="username"
          type="text"
          required
        >
      </div>
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
        Зарегистрироваться
      </button>
    </form>
    <p>
      <RouterLink to="/login">
        Уже есть аккаунт
      </RouterLink>
    </p>
  </div>
</template>
