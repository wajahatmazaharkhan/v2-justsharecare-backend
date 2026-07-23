// ===============================================
// Router: Form
// File: Form.router.js
// ===============================================
//
// • This file contains all routes related to the Form module.
//
// • File name starts with Capital (Form.router.js)
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
import { FormController } from "../controllers/index.js";
import { StoreWaitingListUser } from "../controllers/Form.controllers.js";

export const FormRouter = Router();

FormRouter.route("/submit").post(FormController.FormController);
FormRouter.route("/waiting-list").post(StoreWaitingListUser)
