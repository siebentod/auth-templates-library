# react-context-axios-with_refresh

Шаблон авторизации для **React + axios**.

Примеры страниц — в `src/examples/`.

## Зависимости в целевом проекте

- `axios`

## Подключение

1. Скопируйте папку `src/` в проект (или только нужные модули).
2. Оберните приложение в `AuthProvider` (см. `src/examples/pages.tsx`).
3. Настройте Vite proxy — **обязательно для dev** с httpOnly refresh cookie и `SameSite=Lax`:

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

Axios уже настроен: `baseURL: '/api'`, `withCredentials: true`.

## Контракт API

| Метод | Путь | Ответ |
|-------|------|-------|
| `POST` | `/auth/login` | `{ accessToken, user }` + cookie `refreshToken` |
| `GET` | `/auth/me` | `User` (header `Authorization: Bearer`) |
| `POST` | `/auth/refresh` | `{ accessToken }` + новый cookie |
| `POST` | `/auth/logout` | `204`, cookie очищается |
| `POST` | `/auth/register` | `User` (без токенов) |

Refresh cookie: `httpOnly`, `SameSite=Lax`, `Path=/api/auth`.

## Как это работает

### Хранение токенов

- **Access token** — `localStorage` (ключ `accessToken`, настраивается в `auth-config.ts`).
- **Refresh token** — httpOnly cookie, фронт не читает и не пишет.

### Init при старте / F5

1. Читается access из `localStorage`, выставляется header.
2. `GET /auth/me` — если успех, user в state.
3. При неудаче — `POST /auth/refresh` (cookie) → новый access → снова `me`.
4. Если access в storage не было — всё равно пробуется refresh (cookie могла остаться).
5. Если ничего не сработало — гость.

### Interceptor

При 401 на обычных запросах — один refresh на все параллельные запросы (очередь), затем retry.

Не перехватывается: `/auth/login`, `/auth/register`, `/auth/refresh`.

### Register

После register **нет** автологина — пользователь идёт на `/login` (см. example).

## Структура

```
src/
  configs/auth-config.ts       — endpoints, ключи
  api/api-client.ts            — axios instance, refresh, interceptor
  utils/access-token-storage.ts
  context/                     — AuthContext, AuthProvider
  hooks/use-auth.ts
  guards/                      — AuthGuard, GuestGuard
  examples/
    login.tsx
    registration.tsx
    home.tsx
    pages.tsx                  — маршруты
```

**Рекомендуется в prod:** один домен (`app.example.com` + `app.example.com/api` через reverse proxy).