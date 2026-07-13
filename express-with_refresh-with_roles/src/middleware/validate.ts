import type { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ");
        _res.status(400).json({ message: `Validation error: ${message}` });
        return;
      }
      next(err);
    }
  };
}
