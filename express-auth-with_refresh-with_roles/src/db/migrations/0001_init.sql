CREATE TYPE "role" AS ENUM ('admin', 'user');

CREATE TABLE IF NOT EXISTS "users" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "username"   VARCHAR(50) NOT NULL UNIQUE,
  "email"      VARCHAR(255) NOT NULL UNIQUE,
  "password"   VARCHAR(255) NOT NULL,
  "role"       "role" NOT NULL DEFAULT 'user',
  "is_active"  BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "refresh_tokens" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"     UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token_hash"  VARCHAR(255) NOT NULL,
  "expires_at"  TIMESTAMP NOT NULL,
  "created_at"  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "refresh_tokens_token_hash_idx" ON "refresh_tokens" ("token_hash");
CREATE INDEX IF NOT EXISTS "refresh_tokens_user_id_idx"   ON "refresh_tokens" ("user_id");
