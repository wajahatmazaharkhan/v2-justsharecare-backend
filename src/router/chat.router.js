import { Router } from "express";

import { ChatController } from "../controllers/index.js";
import { dynamicAuth } from "../middlewares/auth.middlewares.js";

export const chatRouter = Router();

chatRouter.route("/addconversastion").post(dynamicAuth, ChatController.createConversastion);
chatRouter.route("/getchat").get(dynamicAuth , ChatController.getChat);
