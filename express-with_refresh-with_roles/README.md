# User Service

REST API сервис управления пользователями на **Express + TypeScript + PostgreSQL + Drizzle ORM**.

## Стек

- **Runtime:** Node.js 22+
- **Framework:** Express 4
- **Language:** TypeScript 5 (strict mode)
- **Database:** PostgreSQL 15+
- **ORM:** Drizzle ORM
- **Auth:** JWT (Access Token) + опaque Refresh Token с ротацией
- **Validation:** Zod
- **Password hashing:** bcrypt (cost factor 12)

---

## Быстрый старт

```bash
# 1. Установить зависимости
npm install

# 2. Настроить окружение
cp .env.example .env
# Заполнить .env (см. раздел "Переменные окружения")

# 3. Создать базу данных
psql -U postgres -c "CREATE DATABASE refresh_auth_user_roles;"

# 4. Применить миграцию БД
npm run db:migrate

# 5. Запустить в dev-режиме
npm run dev
```

---

## Переменные окружения

| Переменная | Пример | Описание |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/db` | Строка подключения к PostgreSQL |
| `JWT_ACCESS_SECRET` | `super-secret-32-chars-minimum!!` | Секрет для подписи Access Token (мин. 32 символа) |
| `JWT_REFRESH_SECRET` | `another-secret-32-chars-minimum!` | Секрет для Refresh Token (мин. 32 символа) |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Время жизни Access Token |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Время жизни Refresh Token |
| `PORT` | `3000` | Порт HTTP-сервера |
| `NODE_ENV` | `development` | Окружение (`development` / `production` / `test`) |
| `FRONTEND_URL` | `http://localhost:5173` | Разрешённые origin фронтенда для CORS (через запятую) |

Все переменные валидируются при старте через Zod — если чего-то не хватает, приложение упадёт с понятным сообщением об ошибке.

---

## Скрипты

```bash
npm run dev
npm run build
npm run start      # Запуск скомпилированного кода
npm run db:generate  # Сгенерировать миграции Drizzle Kit
npm run db:migrate   # Применить миграции Drizzle Kit
```

---

## Структура проекта

```
src/
├── config/
│   ├── env.ts            # Zod-валидация переменных окружения
│   ├── db.ts             # Подключение Drizzle + pg Pool
│   └── app.ts            # Сборка Express-приложения
│
├── schemas/
│   ├── user.schema.ts    # Drizzle-схема таблицы users
│   └── token.schema.ts   # Drizzle-схема таблицы refresh_tokens
│
├── types/
│   ├── user.types.ts     # UserPublic, DTO-типы
│   ├── token.types.ts    # TokenPair, JwtPayload
│   └── express.d.ts      # Расширение Express Request (req.user)
│
├── shared/
│   ├── errors/           # AppError и наследники (404, 401, 403, 409)
│   └── utils/
│       ├── hash.ts       # bcrypt + SHA-256 для токенов
│       └── jwt.ts        # sign / verify / generate helpers
│
├── repositories/
│   ├── user.repository.ts   # SQL-запросы к таблице users
│   └── token.repository.ts  # SQL-запросы к таблице refresh_tokens
│
├── services/
│   ├── auth.service.ts   # register, login, refresh, logout
│   └── user.service.ts   # getById, getAll, setActive
│
├── middleware/
│   ├── authenticate.ts   # Проверка Access Token → req.user
│   ├── authorize.ts      # Проверка роли / владельца ресурса
│   ├── validate.ts       # Фабрика middleware для Zod-валидации тела запроса
│   └── errorHandler.ts   # Централизованная обработка ошибок
│
├── validators/
│   ├── auth.validators.ts   # Zod-схемы для /auth эндпоинтов
│   └── user.validators.ts   # Zod-схемы для /users эндпоинтов
│
├── controllers/
│   ├── auth.controller.ts   # HTTP-обработчики авторизации
│   └── user.controller.ts   # HTTP-обработчики пользователей
│
├── routes/
│   ├── index.ts          # Корневой роутер /api
│   ├── auth.routes.ts    # /api/auth/*
│   └── user.routes.ts    # /api/users/*
│
├── db/
│   └── migrations/
│       └── 0001_init.sql # Начальная миграция (users + refresh_tokens)
│
└── index.ts              # Entry point, graceful shutdown
```

---

## API

Базовый путь: `/api`

### Авторизация

#### `POST /auth/register`
Регистрация нового пользователя.

**Body:**
```json
{
  "username": "ivan",
  "email": "ivan@example.com",
  "password": "securepassword"
}
```

**Response `201`:**
```json
{
  "id": "uuid",
  "username": "ivan",
  "email": "ivan@example.com",
  "role": "user",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

#### `POST /auth/login`
Авторизация. Access token возвращается в JSON, refresh token устанавливается в **httpOnly cookie** (`refreshToken`, path `/api/auth`, `SameSite=Lax`).

**Body:**
```json
{
  "email": "ivan@example.com",
  "password": "securepassword"
}
```

**Response `200`:**
```json
{
  "accessToken": "eyJ...",
  "user": {
    "id": "uuid",
    "username": "ivan",
    "email": "ivan@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Set-Cookie:** `refreshToken=...; HttpOnly; SameSite=Lax; Path=/api/auth`

---

#### `GET /auth/me`
Текущий авторизованный пользователь. Используется при инициализации приложения и после обновления страницы.

**Headers:** `Authorization: Bearer <accessToken>`

**Response `200`:** объект `UserPublic`

---

#### `POST /auth/refresh`
Обновление токенов. Refresh token читается из httpOnly cookie, старый инвалидируется (rotation).

**Headers:** `X-Requested-With: XMLHttpRequest`

**Cookie:** `refreshToken` (отправляется браузером автоматически при `credentials: 'include'`)

**Body:** не требуется

**Response `200`:**
```json
{
  "accessToken": "eyJ..."
}
```

**Set-Cookie:** новый `refreshToken` (rotation)

---

#### `POST /auth/logout`
Инвалидация refresh token и очистка cookie. Access token не требуется.

**Headers:** `X-Requested-With: XMLHttpRequest`

**Cookie:** `refreshToken`

**Response `204`:** No Content (cookie очищается через `Set-Cookie`)

---

### Пользователи

Все эндпоинты требуют заголовка `Authorization: Bearer <accessToken>`.

---

#### `GET /users`
Список всех пользователей. **Только для admin.**

**Response `200`:** массив объектов `UserPublic`

---

#### `GET /users/:id`
Получить пользователя по ID. Доступно **admin** или **самому пользователю**.

**Response `200`:** объект `UserPublic`

---

#### `PATCH /users/:id/status`
Изменить статус активности пользователя. Доступно **admin** или **самому пользователю**.
При блокировке (`isActive: false`) все сессии пользователя немедленно инвалидируются.

**Body:**
```json
{
  "isActive": false
}
```

**Response `200`:** обновлённый объект `UserPublic`

---

## Схема авторизации (Refresh Token Rotation)

```
Клиент                        Сервер                     БД
  │                              │                         │
  ├─ POST /auth/login ──────────>│                         │
  │                              ├─ INSERT token_hash ────>│
  │<─ { accessToken } + cookie ──┤  Set-Cookie: RT1        │
  │                              │                         │
  │  [access token истёк]        │                         │
  │                              │                         │
  ├─ POST /auth/refresh ────────>│  Cookie: RT1            │
  │                              ├─ SELECT hash(RT1) ─────>│
  │                              │<─ найден ───────────────┤
  │                              ├─ DELETE hash(RT1) ─────>│  ← старый удалён
  │                              ├─ INSERT hash(RT2) ─────>│  ← новый сохранён
  │<─ { accessToken } + cookie ──┤  Set-Cookie: RT2        │
  │                              │                         │
  │  [RT1 украден, атака]        │                         │
  │                              │                         │
  ├─ POST /auth/refresh ────────>│  Cookie: RT1            │
  │                              ├─ SELECT hash(RT1) ─────>│
  │                              │<─ не найден ────────────┤
  │<─ 401 Unauthorized ──────────┤                         │
```

- Refresh token на клиенте хранится только в **httpOnly cookie** (недоступен JS).
- В БД хранится SHA-256 хэш — даже при утечке базы сами токены защищены.
- В production рекомендуется same-origin через reverse proxy (`/api` → бэкенд).
- Запросы refresh/logout с фронта: `fetch(url, { credentials: 'include', headers: { 'X-Requested-With': 'XMLHttpRequest' } })`.

---

## Коды ошибок

| Код | Причина |
|---|---|
| `400` | Ошибка валидации тела запроса |
| `401` | Отсутствует или невалидный токен |
| `403` | Недостаточно прав / аккаунт заблокирован |
| `404` | Пользователь не найден |
| `409` | Email уже используется |
| `500` | Внутренняя ошибка сервера |

В `production` стек трейс и детали внутренних ошибок никогда не возвращаются клиенту.