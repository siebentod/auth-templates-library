import type { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../shared/errors";

const XHR_HEADER_VALUE = "xmlhttprequest";

export function requireXhrHeader(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const value = req.get("X-Requested-With");

  if (value?.toLowerCase() !== XHR_HEADER_VALUE) {
    next(new ForbiddenError("Missing or invalid X-Requested-With header"));
    return;
  }

  next();
}
