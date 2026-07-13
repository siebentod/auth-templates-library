<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth-store'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const handleLogout = () => {
  void authStore.logout()
}
</script>

<template>
  <div>
    <h1>Home</h1>
    <template v-if="user">
      <p>Username: {{ user.username }}</p>
      <p>Email: {{ user.email }}</p>
      <button
        type="button"
        @click="handleLogout"
      >
        Выйти
      </button>
    </template>
  </div>
</template>
