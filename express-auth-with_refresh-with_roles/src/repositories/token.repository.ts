import { eq } from "drizzle-orm";
import { db } from "../config/db";
import { refreshTokens } from "../schemas/token.schema";
import type { RefreshTokenRow } from "../schemas/token.schema";

export const tokenRepository = {
  async create(
    userId: string,
    tokenHash: string,
    expiresAt: Date
  ): Promise<RefreshTokenRow> {
    const result = await db
      .insert(refreshTokens)
      .values({ userId, tokenHash, expiresAt })
      .returning();
    return result[0];
  },

  async findByHash(tokenHash: string): Promise<RefreshTokenRow | null> {
    const result = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1);
    return result[0] ?? null;
  },

  async deleteByHash(tokenHash: string): Promise<void> {
    await db
      .delete(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash));
  },

  async deleteAllByUserId(userId: string): Promise<void> {
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  },
};
