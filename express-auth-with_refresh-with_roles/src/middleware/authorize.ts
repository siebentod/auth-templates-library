import type { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../shared/errors";
import type { Role } from "../types/user.types";

type AuthorizeOptions = {
  roles?: Role[];
  orOwner?: boolean; // allows passing if req.user.sub === req.params.id
};

export function authorize(options: AuthorizeOptions = {}) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Not authenticated");
      }

      const { roles = [], orOwner = false } = options;
      const hasRole = roles.length === 0 || roles.includes(req.user.role);
      const isOwner = orOwner && req.user.sub === req.params.id;

      if (!hasRole && !isOwner) {
        throw new ForbiddenError("Insufficient permissions");
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
