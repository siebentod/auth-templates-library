import type { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service";
import { UnauthorizedError } from "../shared/errors";
import type { SetActiveDto } from "../validators/user.validators";

export const userController = {
  async getById(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();

      const user = await userService.getById({
        requesterId: req.user.sub,
        requesterRole: req.user.role,
        targetId: req.params.id,
      });

      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  },

  async getAll(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const users = await userService.getAll();
      res.status(200).json(users);
    } catch (err) {
      next(err);
    }
  },

  async setActive(
    req: Request<{ id: string }, {}, SetActiveDto>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();

      const user = await userService.setActive({
        requesterId: req.user.sub,
        requesterRole: req.user.role,
        targetId: req.params.id,
        isActive: req.body.isActive,
      });

      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  },
};
