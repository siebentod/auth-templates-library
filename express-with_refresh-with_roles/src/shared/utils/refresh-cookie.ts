import type { CookieOptions, Request, Response } from "express";
import { env } from "../../config/env";
import { refreshTokenMaxAgeMs } from "./jwt";

export const REFRESH_COOKIE_NAME = "refreshToken";
export const REFRESH_COOKIE_PATH = "/api/auth";

function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: REFRESH_COOKIE_PATH,
    maxAge: refreshTokenMaxAgeMs(),
  };
}

export function setRefreshCookie(res: Response, refreshToken: string): void {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: REFRESH_COOKIE_PATH,
  });
}

export function getRefreshTokenFromRequest(req: Request): string | undefined {
  const token = req.cookies[REFRESH_COOKIE_NAME];
  return typeof token === "string" && token.length > 0 ? token : undefined;
}
