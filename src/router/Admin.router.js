import { Router } from "express";
import { AdminCounsellor, UserController } from "../controllers/index.js";

export const AdminRouter = Router();

AdminRouter.get("/get-all-users", UserController.getAllUsers);
AdminRouter.get("/get-user-by-id/:id", UserController.getUserById);
AdminRouter.patch(
  "/update-user-status/:id",
  UserController.updateUserStatusById
);
AdminRouter.patch("/update-user-role/:id", UserController.updateUserRoleById);
AdminRouter.delete("/delete-user/:id", UserController.deleteUserById);
AdminRouter.get("/get-counsellor-count", AdminCounsellor.getCounsellorCount);
AdminRouter.get(
  "/get-pending-verification-count",
  AdminCounsellor.getPendingVerifications
);
AdminRouter.get("/get-registered-count", AdminCounsellor.getRegisteredCount);
AdminRouter.get("/total-appointments", AdminCounsellor.getTotalAppointments);
AdminRouter.get("/get-revenue-month", AdminCounsellor.getCurrentMonthRevenue);

AdminRouter.get(
  "/get-canceled-appointments",
  AdminCounsellor.getCanceledAppointments
);
AdminRouter.get(
  "/get-canceled-appointments-length",
  AdminCounsellor.getCanceledAppointmentsLength
);
AdminRouter.get("/latest-counsellors", AdminCounsellor.getLatestCounsellors);
AdminRouter.get("/stats/revenue-weekly", AdminCounsellor.getWeeklyRevenue);
AdminRouter.get("/get-all-appointments", AdminCounsellor.getAllAppointments);
AdminRouter.get("/get-all-assessments", AdminCounsellor.getAllAssessments);
AdminRouter.get("/payments/all", AdminCounsellor.getAllPayments);
AdminRouter.get("/all-appointments", AdminCounsellor.getAllAppointmentsAdmin);
