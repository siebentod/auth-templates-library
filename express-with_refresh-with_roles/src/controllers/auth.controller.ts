import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { UnauthorizedError } from "../shared/errors";
import {
  setRefreshCookie,
  clearRefreshCookie,
  getRefreshTokenFromRequest,
} from "../shared/utils/refresh-cookie";
import type { RegisterDto, LoginDto } from "../validators/auth.validators";

export const authController = {
  async register(
    req: Request<{}, {}, RegisterDto>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await authService.register(req.body);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  },

  async login(
    req: Request<{}, {}, LoginDto>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      setRefreshCookie(res, result.refreshToken);

      res.status(200).json({
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (err) {
      next(err);
    }
  },

  async me(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();

      const user = await authService.me(req.user.sub);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = getRefreshTokenFromRequest(req);
      if (!refreshToken) {
        throw new UnauthorizedError("Refresh token is missing");
      }

      const tokens = await authService.refresh(refreshToken);

      setRefreshCookie(res, tokens.refreshToken);

      res.status(200).json({ accessToken: tokens.accessToken });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = getRefreshTokenFromRequest(req);

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      clearRefreshCookie(res);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
