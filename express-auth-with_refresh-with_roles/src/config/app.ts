import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { corsOptions } from "./cors";
import { router } from "../routes";
import { errorHandler } from "../middleware/errorHandler";

export function createApp() {
  const app = express();

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(cookieParser());

  app.use("/api", router);

  app.use(errorHandler);

  return app;
}
