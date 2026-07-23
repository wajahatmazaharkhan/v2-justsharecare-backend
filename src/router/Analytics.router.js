import { Router } from "express";
import { AnalyticsController } from "../controllers/index.js";
import { adminVerify } from "../middlewares/auth.middlewares.js";

export const analyticsRouter = Router();

analyticsRouter.get(
  "/track",
  adminVerify,
  AnalyticsController.analyticsDashboard
);
