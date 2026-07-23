import { Router } from "express";
import { createAssessment } from "../controllers/assessment.controller.js";
import { dynamicAuth } from "../middlewares/auth.middlewares.js";

export const assessmentRouter = Router();

assessmentRouter.post("/post", dynamicAuth, createAssessment);
