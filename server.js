// ===============================================================
// 📦 Package Imports
// ===============================================================
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import { createServer } from "http";
import { Server } from "socket.io";

// ===============================================================
// 🗄️ Database Import
// ===============================================================
import { connectToDatabase } from "./src/db/db.js";
import { limiter } from "./src/middlewares/rate-limiter.js";
import { sessionConfig } from "./src/config/session.js";
import { cacheControl } from "./src/middlewares/cache-control.js";

// ===============================================================
// 🚦 Routes Import
// ===============================================================
import { FormRouter } from "./src/router/Form.router.js";
import { userRouter } from "./src/router/User.router.js";
import { RazorpayRouter } from "./src/router/Razorypay.router.js";
import { AvailabilityRouter } from "./src/router/Availability.router.js";
import { counsellorRouter } from "./src/router/Counsellor.router.js";
import { AppointmentRouter } from "./src/router/Appointments.router.js";
import { chatRouter } from "./src/router/chat.router.js";
import { messageRouter } from "./src/router/message.router.js";
import { analyticsRouter } from "./src/router/Analytics.router.js";
import { serviceRouter } from "./src/router/services.router.js";
import { notificationRouter } from "./src/router/Notifications.router.js";
import { avRouter } from "./src/router/AvailabilityWeek.js";

// ===============================================================
// 🧠 Other Imports
// ===============================================================
import { Novu } from "@novu/api";
import { trackAnalytics } from "./src/middlewares/trackAnalytics.middlewares.js";
import { errorHandler } from "./src/middlewares/error-handler.js";
import { ApiResponse } from "./src/utils/ApiResponse.js";
import passport from "./src/config/passport-config.js";

// ===============================================================
// Models & Security
// ===============================================================
import { Message } from "./src/models/message.models.js";
import { decryptText } from "./src/security/aes-encryption.js";
import { User } from "./src/models/User.models.js";
import { AdminRouter } from "./src/router/Admin.router.js";
import {
  adminVerify,
  dynamicAuth,
} from "./src/middlewares/auth.middlewares.js";

// ===============================================================
// 🔧 Environment Variables
// ===============================================================
import config from "./config/config.js";

dotenv.config();
const port = config.PORT || 4000;
const allowedOrigins = config.CORS_ORIGIN ? config.CORS_ORIGIN.split(",") : [];

// ===============================================================
// 🌐 Express App & HTTP Server
// ===============================================================
const app = express();
const server = createServer(app);

// ===============================================================
// ⚡ Socket.IO
// ===============================================================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length ? allowedOrigins : "*",
    methods: ["GET", "POST"],
  },
});

// ===============================================================
// 🔗 Initialize Socket.IO (moved logic)
// ===============================================================
import { initSocket } from "./src/socket/socket.js";
import { startAppointmentReminderCron } from "./src/scheduler/appointmentReminderCron.js";
import { sendRealtimeNotification } from "./src/realtime/sendRealtimeNotification.js";
import { assessmentRouter } from "./src/router/assessment.router.js";
initSocket(io);

// ===============================================================
// 🌐 CORS Options
// ===============================================================
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS blocked for origin: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "cache-control",
    "svix-id",
    "svix-timestamp",
    "svix-signature",
  ],
};

// ===============================================================
// 🧩 Middlewares
// ===============================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.static("/tmp", { index: false }));
app.use(errorHandler);
app.use(trackAnalytics);
// app.use(limiter);
// app.use(csurf({ cookie: true }));
app.set("trust proxy", 1);
app.use(sessionConfig);
app.use(cacheControl);
app.use(passport.initialize());
app.use(passport.session());
// ===============================================================
// 🏠 Default Route
// ===============================================================
app.get("/", (req, res) => {
  res.status(200).json(new ApiResponse(200, null, "Web Server is Running..."));
});

// ===============================================================
//  Razorpay Instance
// ===============================================================
export const instance = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_KEY_SECRET,
});

// ===============================================================
//  Novu Instance
// ===============================================================
export const novu = new Novu({
  secretKey: config.NOVU_SECRET_KEY,
});

// ===============================================================
// 📌 Register Routes
// ===============================================================

/**
 * Simulate Network Delay
 */
// app.use(async (req, res, next) => ( await new Promise((resolve) => setTimeout(resolve, 10000)), next()));

app.use("/", userRouter);
app.use("/api/form", FormRouter);
app.use("/api/user", userRouter);
app.use("/api/availability", AvailabilityRouter);
app.use("/api/counsellor", counsellorRouter);
app.use("/api/appointments", AppointmentRouter);
app.use("/analytics", analyticsRouter);
app.use("/api/service", serviceRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);
app.use("/api/admin", adminVerify, AdminRouter);
app.use("/api", RazorpayRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/assessment", assessmentRouter);
app.use("/api/availability", avRouter);

// ===============================================================
// 🟢 Connect to DB & Start Server
// ===============================================================
connectToDatabase().then(() => {
  server.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
  // ===========================================================
  // ⏰ Start cron jobs here
  // ===========================================================
  startAppointmentReminderCron();
});
