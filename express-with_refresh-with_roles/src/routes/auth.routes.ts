import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate";
import { requireXhrHeader } from "../middleware/require-xhr-header";
import { validateBody } from "../middleware/validate";
import { registerSchema, loginSchema } from "../validators/auth.validators";

export const authRouter = Router();

authRouter.post(
  "/register",
  validateBody(registerSchema),
  authController.register
);
authRouter.post("/login", validateBody(loginSchema), authController.login);
authRouter.get("/me", authenticate, authController.me);
authRouter.post("/refresh", requireXhrHeader, authController.refresh);
authRouter.post("/logout", requireXhrHeader, authController.logout);
