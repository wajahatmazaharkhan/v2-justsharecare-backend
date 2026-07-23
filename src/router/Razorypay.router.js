// ===============================================
// Router: Razorpay
// File: Razorpay.router.js
// ===============================================
//
// • This file contains all routes related to the Form module.
//
// • File name starts with Capital (Razorpay.router.js)
//   because routers represent a feature/module in the project.
//
// • Centralized import from `controllers/index.js`
//   so we don’t need long import paths.
//
// • Router uses Express.js `Router()` to define endpoints
//   related only to Form operations.
//
// ===============================================

import { Router } from "express";
import { RazorpayController } from "../controllers/index.js";
import { dynamicAuth } from "../middlewares/auth.middlewares.js";

export const RazorpayRouter = Router();

RazorpayRouter.route("/create-order").post(
  dynamicAuth,
  RazorpayController.createRazorpayOrder
);
RazorpayRouter.route("/get-payment-keys").get(
  dynamicAuth,
  RazorpayController.getRazorpayKeys
);

RazorpayRouter.route("/payment-verification").post(
  dynamicAuth,
  RazorpayController.paymentVerification
);

RazorpayRouter.route("/payment-refund").post(
  dynamicAuth,
  RazorpayController.createRefund
);
