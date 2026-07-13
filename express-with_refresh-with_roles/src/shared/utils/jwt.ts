import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../config/env';
import { UnauthorizedError } from '../errors';
import type { JwtPayload, TokenPair } from '../../types/token.types';
import type { Role } from '../../types/user.types';

function msFromExpString(exp: string): number {
  const unit = exp.slice(-1);
  const value = parseInt(exp.slice(0, -1), 10);
  const multipliers: Record<string, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return value * (multipliers[unit] ?? 1_000);
}

export function signAccessToken(userId: string, role: Role): string {
  return jwt.sign({ sub: userId, role } as JwtPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Refresh token = random opaque string (not a JWT).
 * This way its payload cannot be decoded without the DB lookup,
 * and rotation invalidation is purely DB-driven.
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

export function refreshTokenMaxAgeMs(): number {
  return msFromExpString(env.JWT_REFRESH_EXPIRES_IN);
}

export function refreshTokenExpiresAt(): Date {
  return new Date(Date.now() + refreshTokenMaxAgeMs());
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired access token');
  }
}

export function generateTokenPair(userId: string, role: Role): TokenPair {
  return {
    accessToken: signAccessToken(userId, role),
    refreshToken: generateRefreshToken(),
  };
}
