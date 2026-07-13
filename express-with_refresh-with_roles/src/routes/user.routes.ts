import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import { setActiveSchema } from "../validators/user.validators";

export const userRouter = Router();

// GET /users — admin only
userRouter.get(
  "/",
  authenticate,
  authorize({ roles: ["admin"] }),
  userController.getAll
);

// GET /users/:id — admin or the user themselves
userRouter.get(
  "/:id",
  authenticate,
  authorize({ roles: ["admin"], orOwner: true }),
  userController.getById
);

// PATCH /users/:id/status — admin or the user themselves
userRouter.patch(
  "/:id/status",
  authenticate,
  authorize({ roles: ["admin"], orOwner: true }),
  validateBody(setActiveSchema),
  userController.setActive
);
