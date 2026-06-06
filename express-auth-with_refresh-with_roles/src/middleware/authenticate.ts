import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../shared/utils/jwt";
import { UnauthorizedError, ForbiddenError } from "../shared/errors";
import { userRepository } from "../repositories/user.repository";

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or malformed Authorization header");
    }

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);

    // Check user still exists and is active on every request.
    // This ensures blocked users can't continue using a valid access token.
    const user = await userRepository.findById(payload.sub);
    if (!user) throw new UnauthorizedError("User not found");
    if (!user.isActive) throw new ForbiddenError("Account is blocked");

    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
}
