# vue-auth-inject-axios-with_refresh

Шаблон авторизации для **Vue 3 + axios + provide/inject**.

Примеры страниц — в `src/examples/`.

## Зависимости в целевом проекте

- `axios`

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

## Interceptor

При 401 на обычных запросах — один refresh на все параллельные запросы (очередь), затем retry.

Не перехватывается: `/auth/login`, `/auth/register`, `/auth/refresh`.

### Route guards

`setupAuthGuards(router)` регистрирует глобальный `beforeEach`:

- `meta.requiresAuth` и нет user → `/login?returnUrl=...`
- `meta.guestOnly` и есть user → `/`

## Структура

```
src/
  configs/auth-config.ts         — endpoints, ключи
  api/api-client.ts              — axios instance, refresh, interceptor
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

## SameSite и продакшен

**Рекомендуется в prod:** один домен (`app.example.com` + `app.example.com/api` через reverse proxy).