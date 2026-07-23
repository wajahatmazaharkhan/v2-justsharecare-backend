import { Router } from "express";
import { addAvailability,getAvailability,updateAvailability,deleteAvailability } from "../controllers/RecurringAvilability.js";
import { counsellorVerify, dynamicAuth } from "../middlewares/auth.middlewares.js";
export const avRouter = Router();

avRouter.post("/add",dynamicAuth,addAvailability);
avRouter.get("/get",counsellorVerify,getAvailability);
avRouter.put("/update",dynamicAuth,updateAvailability);
avRouter.delete("/delete",dynamicAuth,deleteAvailability);
