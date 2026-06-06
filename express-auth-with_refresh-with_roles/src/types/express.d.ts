import type { JwtPayload } from './token.types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
