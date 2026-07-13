import { eq } from "drizzle-orm";
import { db } from "../config/db";
import { users } from "../schemas/user.schema";
import type { UserInsert, UserRow } from "../schemas/user.schema";
import type { UserPublic } from "../types/user.types";

// Strip password before returning to upper layers
function toPublic(user: UserRow): UserPublic {
  const { password: _password, ...rest } = user;
  return rest;
}

export const userRepository = {
  async findById(id: string): Promise<UserPublic | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] ? toPublic(result[0]) : null;
  },

  // Used for auth — deliberately returns password hash
  async findByEmailWithPassword(email: string): Promise<UserRow | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] ?? null;
  },

  async findByEmail(email: string): Promise<UserPublic | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] ? toPublic(result[0]) : null;
  },

  async findByUsername(username: string): Promise<UserPublic | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return result[0] ? toPublic(result[0]) : null;
  },

  async create(data: UserInsert): Promise<UserPublic> {
    const result = await db.insert(users).values(data).returning();
    return toPublic(result[0]);
  },

  async findAll(): Promise<UserPublic[]> {
    const result = await db.select().from(users);
    return result.map(toPublic);
  },

  async setActive(id: string, isActive: boolean): Promise<UserPublic | null> {
    const result = await db
      .update(users)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0] ? toPublic(result[0]) : null;
  },
};
