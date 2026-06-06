<script setup lang="ts">
import { useAuth } from '../composables/use-auth'

const { user, logout } = useAuth()

const handleLogout = () => {
  void logout()
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
