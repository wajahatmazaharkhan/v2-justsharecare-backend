// ===============================================
// Controller: Form
// File: Razorpay.controllers.js
// ===============================================
//
// • File name starts with Capital (Razorpay.controllers.js)
//   because it represents a controller class/module.
//
// • ".controllers.js" clearly indicates this file contains
//   request-handling logic for the Form model.
//
// • Follows best practices:
//     - Zod validation for input
//     - Proper async/await usage
//     - Return statements to prevent duplicate responses
//     - Clean Fastify-compatible response format
//
// ===============================================

import { ZodError } from "zod";
import { OrderValidation } from "../validator/Razorpay.validation.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Payment } from "../models/Payment.model.js";
import crypto from "crypto";
import { Appointment } from "../models/Appointments.model.js";
import { instance } from "../../server.js";
import config from "../../config/config.js";

export const createRazorpayOrder = async (req, res) => {
  let options;
  try {
    options = OrderValidation.parse(req.body);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Validation Failed!", error.message);
      return res
        .status(400)
        .json(new ApiError(400, "Validation failure", error.errors));
    } else {
      console.error("An unexpected error occurred during validation:", error);
      return res.status(500).json(new ApiError(500, "Internal Server Error"));
    }
  }
  if (!options.currency || !options.amount) {
    return res.status(400).json(new ApiError(400, "all fields are required"));
  }
  const order = await instance.orders.create(options);
  console.log("Order created", order);
  return res
    .status(200)
    .json(new ApiResponse(200, order, "order created successfully"));
};

export const getRazorpayKeys = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, config.RAZORPAY_KEY_ID));
});

export const paymentVerification = async (req, res) => {
  // Avoiding Async-handler because inner try-catch block is required.
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    appointmentId,
  } = req.body;
  console.log(req.body);
  console.log("// --- CHECKING PAYMENT STATUS --- //");
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  try {
    const expectedSignature = crypto
      .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;
    if (!isSignatureValid) {
      console.log("PAYMENT VERIFICATION FAILED INVALID SIGNATURE");
      return res
        .status(400)
        .json(new ApiError(400, "Invalid Payment Signature"));
    }
    if (!appointmentId) {
      return res
        .status(400)
        .json(new ApiError(400, "Appointment ID is required."));
    }
    const appointmentExists = await Appointment.findById(appointmentId);
    if (!appointmentExists) {
      return res.status(404).json(new ApiError("Appointment not found"));
    }
    appointmentExists.payment_status = "successful";
    await appointmentExists.save();
    console.log("PAYMENT VERIFIED SUCCESSFULLY");
    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      appointment_id: appointmentId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Payment Verified Successfully"));
  } catch (error) {
    console.log("Payment verification error:", error);
    // const appointmentExists = Appointment.findByIdAndDelete(appointmentId);
    // if (!appointmentExists) {
    //   return res
    //     .status(500)
    //     .json(
    //       new ApiError("Failed to cancel appointment due to payment failure.")
    //     );
    // }
    return res
      .status(500)
      .json(new ApiError(500, "Payment verification failed"));
  }
};

export const createRefund = asyncHandler(async (req, res) => {
  const { appointmentId } = req.body;

  if (!appointmentId) {
    return res
      .status(400)
      .json(new ApiError(400, "Appointment ID is required."));
  }

  const payment = await Payment.findOne({
    appointment_id: appointmentId,
  }).lean();

  console.log(payment);

  const appointmentFound = await Appointment.findById(appointmentId);
  console.log("appointmentFound", appointmentFound);
  if (!appointmentFound || !payment.appointment_id) {
    return res
      .status(404)
      .json(
        new ApiError(404, "Payment record not found for this appointment.")
      );
  }

  // deduct 10% cancellation charge
  const charge = (appointmentFound.price * 10) / 100;
  try {
    const refund = await instance.payments.refund(
      payment.razorpay_payment_id.toString(),
      {
        speed: "normal",
        amount: Number((appointmentFound.price - charge) * 100),
        notes: {
          reason: "Appointment cancelled by user",
        },
        receipt: `refund_${appointmentId}`,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Refund initiated successfully",
      refund,
    });
  } catch (error) {
    console.error("Refund Error:", error);
    return res
      .status(500)
      .json(
        new ApiError(500, "Refund failed", error?.error?.description || error)
      );
  }
});
