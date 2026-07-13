ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" VARCHAR(50);

UPDATE "users"
SET "username" = split_part("email", '@', 1) || '_' || substr("id"::text, 1, 8)
WHERE "username" IS NULL;

ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "users_username_unique" ON "users" ("username");
