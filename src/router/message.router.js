import { Router } from "express";
import { MessageController } from "../controllers/index.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { dynamicAuth } from "../middlewares/auth.middlewares.js";

export const messageRouter = Router();

messageRouter.route("/sendmessage").post(upload.array("attachments",10) ,dynamicAuth, MessageController.sendMessage )
messageRouter.route("/getmessage/:conversationId").get(dynamicAuth,MessageController.getMessages);