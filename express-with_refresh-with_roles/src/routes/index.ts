import { Router } from "express";
import { authRouter } from "./auth.routes";
import { userRouter } from "./user.routes";

export const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
