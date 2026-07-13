import type { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/errors/AppError";
import { env } from "../config/env";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // Unknown error — log details internally, never expose to client
  console.error("[Unhandled error]", err);

  res.status(500).json({
    message:
      env.NODE_ENV === "production" ? "Internal server error" : String(err),
  });
}
