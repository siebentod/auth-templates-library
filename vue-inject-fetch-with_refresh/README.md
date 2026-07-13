# vue-inject-fetch-with_refresh

Шаблон авторизации для **Vue 3 + fetch + provide/inject** (без axios).

Примеры страниц — в `src/examples/`.

## Зависимости в целевом проекте

- `vue-router`

Нет дополнительных HTTP-библиотек — только нативный `fetch`.

## Подключение

1. Скопируйте папку `src/` в проект (или только нужные модули).
2. Подключите `createAuthPlugin()` и вызовите `initAuth()` до `app.mount()` (см. `src/examples/main.ts`).
3. Зарегистрируйте guards: `setupAuthGuards(router)`.
4. Настройте Vite proxy — **обязательно для dev** с httpOnly refresh cookie и `SameSite=Lax`:

```ts
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

HTTP-клиент уже настроен: `baseURL: '/api'`, `credentials: 'include'`.

## Контракт API

| Метод | Путь | Ответ |
|-------|------|-------|
| `POST` | `/auth/login` | `{ accessToken, user }` + cookie `refreshToken` |
| `GET` | `/auth/me` | `User` (header `Authorization: Bearer`) |
| `POST` | `/auth/refresh` | `{ accessToken }` + новый cookie |
| `POST` | `/auth/logout` | `204`, cookie очищается |
| `POST` | `/auth/register` | `User` (без токенов) |

Refresh cookie: `httpOnly`, `SameSite=Lax`, `Path=/api/auth`.

## Хранение токенов

- **Access token** — `localStorage` (ключ `accessToken`, настраивается в `auth-config.ts`).
- **Refresh token** — httpOnly cookie, фронт не читает и не пишет.

## Init при старте / F5

Вызывается `await initAuth()` в `main.ts` **до** `app.mount()`.

1. Читается access из `localStorage`, выставляется header.
2. `GET /auth/me` — если успех, user в state.
3. При неудаче — `POST /auth/refresh` (cookie) → новый access → снова `me`.
4. Если access в storage не было — всё равно пробуется refresh (cookie могла остаться).
5. Если ничего не сработало — гость.
6. `loading = false` — к первой навигации init уже завершён.

## 401 и refresh

При 401 на обычных запросах — один refresh на все параллельные запросы (очередь), затем retry.

Не перехватывается: `/auth/login`, `/auth/register`, `/auth/refresh`.

Ошибки HTTP бросаются как `ApiError` (`status`, `body?`).

### Route guards

`setupAuthGuards(router)` регистрирует глобальный `beforeEach`:

- `meta.requiresAuth` и нет user → `/login?returnUrl=...`
- `meta.guestOnly` и есть user → `/`

## Структура

```
src/
  configs/auth-config.ts         — endpoints, ключи
  api/api-client.ts              — fetch client, refresh, 401 retry
  types/api-types.ts             — ApiError, ApiResponse
  utils/access-token-storage.ts
  types/                         — user-types, auth-types, router-meta.d.ts
  composables/use-auth.ts        — singleton state, initAuth, useAuth
  plugins/auth-plugin.ts         — createAuthPlugin()
  router/auth-guards.ts          — setupAuthGuards()
  examples/
    login.vue
    registration.vue
    home.vue
    router.ts
    main.ts
```

## Использование в компонентах

```ts
import { useAuth } from '@/composables/use-auth'
import { ApiError } from '@/types/api-types'

const { user, loading, login } = useAuth()

login(
  { email, password },
  (data) => {
    // data.accessToken, data.user — тело ответа напрямую
    router.push('/')
  },
  (error) => {
    if (error instanceof ApiError && error.status === 401) {
      // ...
    }
  }
)
```

Для остальных API-запросов:

```ts
import apiClient from '@/api/api-client'

const { data } = await apiClient.get<User[]>('/users')
```

## Register

После register **нет** автологина — пользователь идёт на `/login` (см. example).

## SameSite и продакшен

**Рекомендуется в prod:** один домен (`app.example.com` + `app.example.com/api` через reverse proxy).
