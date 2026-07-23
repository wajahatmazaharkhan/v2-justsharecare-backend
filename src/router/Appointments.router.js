import express from "express";
import { AppointmentController } from "../controllers/index.js";
import {
  adminVerify,
  counsellorVerify,
  dynamicAuth,
} from "../middlewares/auth.middlewares.js";

const AppointmentRouter = express.Router();

// create user-books-appointment
AppointmentRouter.post(
  "/create",
  dynamicAuth,
  AppointmentController.createAppointment
);

// read
AppointmentRouter.get(
  "/user",
  dynamicAuth,
  AppointmentController.getUserAppointments
);
AppointmentRouter.get(
  "/counsellor",
  counsellorVerify,
  AppointmentController.getCounsellorAppointments
);

AppointmentRouter.patch(
  "/:appointmentId/approve",
  counsellorVerify,
  AppointmentController.approveAppointmentByCounsellor
);

// update
AppointmentRouter.patch(
  "/:id",
  dynamicAuth,
  AppointmentController.updateAppointment
);
AppointmentRouter.patch(
  "/:id/status",
  dynamicAuth,
  AppointmentController.updateAppointmentStatus
);

// delete
AppointmentRouter.delete(
  "/:id",
  dynamicAuth,
  AppointmentController.deleteAppointment
);

// reschedule appointment
AppointmentRouter.patch(
  "/reschedule/:id",
  counsellorVerify,
  AppointmentController.rescheduleAppointment
);

export { AppointmentRouter };
