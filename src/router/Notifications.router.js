import express from "express";
import {
  createNotification,
  getNotifications,
  getNotificationById,
  markAsRead,
  updateNotification,
  deleteNotification,
  clearAllNotifications,
  sendNotificationToAllUsers,
  sendNotificationToAllCounsellors,
  sendNotificationToAll,
} from "../controllers/Notifications.controller.js";
import { adminVerify } from "../middlewares/auth.middlewares.js";
import { dynamicAuth as authMiddleware } from "../middlewares/auth.middlewares.js";

export const notificationRouter = express.Router();

notificationRouter.post("/", authMiddleware, createNotification);
notificationRouter.get("/", authMiddleware, getNotifications);
notificationRouter.get("/:id", authMiddleware, getNotificationById);
notificationRouter.patch("/:id/read", authMiddleware, markAsRead);
notificationRouter.patch("/:id", authMiddleware, updateNotification);
notificationRouter.delete("/:id", authMiddleware, deleteNotification);
notificationRouter.delete("/", authMiddleware, clearAllNotifications);

// ===============================================================
// 🔔 Admin Broadcast Notifications
// ===============================================================

// admins only → broadcast to all users
notificationRouter.post(
  "/broadcast/users",
  adminVerify,
  sendNotificationToAllUsers
);

// admins only → broadcast to all counsellors
notificationRouter.post(
  "/broadcast/counsellors",
  adminVerify,
  sendNotificationToAllCounsellors
);

// admins only → broadcast to ALL (users + counsellors)
notificationRouter.post("/broadcast/all", adminVerify, sendNotificationToAll);
