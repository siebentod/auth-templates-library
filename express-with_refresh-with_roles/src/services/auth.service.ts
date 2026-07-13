import { userRepository } from "../repositories/user.repository";
import { tokenRepository } from "../repositories/token.repository";
import { hashPassword, comparePassword, hashToken } from "../shared/utils/hash";
import { generateTokenPair, refreshTokenExpiresAt } from "../shared/utils/jwt";
import {
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
} from "../shared/errors";
import type { LoginResult, TokenPair } from "../types/token.types";
import type { UserPublic } from "../types/user.types";
import type { UserCreateInput } from "../types/user.types";

export const authService = {
  async register(dto: UserCreateInput): Promise<UserPublic> {
    const existingEmail = await userRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictError("Email is already in use");
    }

    const existingUsername = await userRepository.findByUsername(dto.username);
    if (existingUsername) {
      throw new ConflictError("Username is already in use");
    }

    const passwordHash = await hashPassword(dto.password);

    return userRepository.create({
      username: dto.username,
      email: dto.email,
      password: passwordHash,
    });
  },

  async login(email: string, password: string): Promise<LoginResult> {
    // Generic message to avoid user enumeration
    const invalidCredentialsError = new UnauthorizedError(
      "Invalid email or password"
    );

    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) throw invalidCredentialsError;

    if (!user.isActive) {
      throw new ForbiddenError("Account is blocked");
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw invalidCredentialsError;

    const pair = generateTokenPair(user.id, user.role);
    const tokenHash = hashToken(pair.refreshToken);
    const expiresAt = refreshTokenExpiresAt();

    await tokenRepository.create(user.id, tokenHash, expiresAt);

    const { password: _password, ...userPublic } = user;

    return { ...pair, user: userPublic };
  },

  async me(userId: string): Promise<UserPublic> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    return user;
  },

  async refresh(incomingRefreshToken: string): Promise<TokenPair> {
    const tokenHash = hashToken(incomingRefreshToken);
    const stored = await tokenRepository.findByHash(tokenHash);

    if (!stored) {
      throw new UnauthorizedError("Refresh token is invalid or already used");
    }

    if (stored.expiresAt < new Date()) {
      await tokenRepository.deleteByHash(tokenHash);
      throw new UnauthorizedError("Refresh token has expired");
    }

    const user = await userRepository.findById(stored.userId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (!user.isActive) {
      throw new ForbiddenError("Account is blocked");
    }

    // Rotation: delete old, issue new
    await tokenRepository.deleteByHash(tokenHash);

    const pair = generateTokenPair(user.id, user.role);
    const newHash = hashToken(pair.refreshToken);
    const expiresAt = refreshTokenExpiresAt();

    await tokenRepository.create(user.id, newHash, expiresAt);

    return pair;
  },

  async logout(incomingRefreshToken: string): Promise<void> {
    const tokenHash = hashToken(incomingRefreshToken);
    // Idempotent — no error if token not found
    await tokenRepository.deleteByHash(tokenHash);
  },
};
