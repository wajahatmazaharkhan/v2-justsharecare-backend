import express from "express";
import { dynamicAuth } from "../middlewares/auth.middlewares.js";

const AvailabilityRouter = express.Router();

AvailabilityRouter.post("/add", dynamicAuth);

export { AvailabilityRouter };
