import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "./env";
import * as userSchema from "../schemas/user.schema";
import * as tokenSchema from "../schemas/token.schema";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle pg client:", err);
  process.exit(1);
});

export const db = drizzle(pool, {
  schema: { ...userSchema, ...tokenSchema },
});

export type Db = typeof db;
