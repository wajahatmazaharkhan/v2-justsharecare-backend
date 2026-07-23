// ===============================================
// Controller: Form
// File: Form.controllers.js
// ===============================================
//
// • File name starts with Capital (Form.controllers.js)
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

import { Form } from "../models/Form.models.js";
import { WaitingList } from "../models/WaitingList.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/async-handler.js";
import { FormValidation } from "../validator/Form.validation.js";

export const FormController = asyncHandler(async (req, res) => {
  // 1. Validate input (Zod throws automatically)
  const data = FormValidation.parse(req.body);

  // 2. Create form
  const newform = await Form.create({
    fullname: data.fullname,
    number: data.number,
  });

  if (!newform) {
    throw new ApiError(500, "Error occurred while creating the form");
  }

  // 3. Success response
  res.status(201).json(new ApiResponse(201, { form: newform }, "ok"));
});

export const StoreWaitingListUser = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json(new ApiError(400, "Email is required."));
  }

  let emailExists = await WaitingList.findOne({ email });

  if (emailExists) {
    return res
      .status(409)
      .json(new ApiError(409, "Email already enrolled"));
  }

  const newEmail = await WaitingList.create({
    email: email,
  });

  if (!newEmail) {
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }

  return res.status(201).json(new ApiResponse(201, email, "Ok"));
});
