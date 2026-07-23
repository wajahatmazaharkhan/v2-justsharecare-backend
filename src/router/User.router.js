import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { UserController } from "../controllers/index.js";
import {
  adminVerify,
  counsellorVerify,
  dynamicAuth,
} from "../middlewares/auth.middlewares.js";
import passport from "../config/passport-config.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.models.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { allocateCounsellor } from "../controllers/User.controllers.js";
import config from "../../config/config.js";

export const userRouter = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

userRouter.post("/signup", UserController.SignUp);
userRouter.post("/login", UserController.Login);
userRouter.get("/get-access-token", UserController.getAccessToken);
userRouter.get("/refresh-token", UserController.refreshToken);

userRouter.get(
  "/auth/google",
  (req, res, next) => {
    console.log("Using callback:", config.GOOGLE_CALLBACK_URL);
    next();
  },
  passport.authenticate("google", {
    scope: ["openid", "profile", "email"],
    // scope:
    //   "https://www.googleapis.com/auth/userinfo.profile openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/user.birthday.read https://www.googleapis.com/auth/user.birthday.read https://www.googleapis.com/auth/user.gender.read https://www.googleapis.com/auth/user.phonenumbers.read",
  })
);

const isProd = config.NODE_ENV === "production";

userRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/user/auth/failure",
    failureMessage: true,
  }),
  async (req, res, next) => {
    try {
      const accessToken = req.user.generateAuthToken();
      const refreshToken = req.user.generateRefreshToken();

      const userExists = await User.findById(req.user._id.toString());

      if (!userExists) {
        return res
          .status(500)
          .json(new ApiError(500, "Authentication Failure"));
      }

      userExists.accessToken = accessToken;

      await userExists.save();

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "None" : "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.redirect(`${config.FRONTEND_URL}/verify-token/?token=${accessToken}`);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

userRouter.get("/auth/failure", (req, res) => {
  const error = req.session.messages?.[0];

  if (error?.code === "EMAIL_ALREADY_EXISTS") {
    return res.status(409).json({
      success: false,
      error: {
        code: "EMAIL_ALREADY_EXISTS",
        message: "Account already exists. Please log in instead.",
      },
    });
  }

  res.status(400).json({
    success: false,
    error: {
      code: "OAUTH_FAILED",
      message: "Google authentication failed",
    },
  });
});

userRouter.post("/logout", (req, res) => {
  const isProd = config.NODE_ENV === "production";

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

userRouter.get("/info", dynamicAuth, UserController.getUserInfo);
userRouter.post("/admin/login", UserController.adminLogin);
userRouter.post("/otp-for-password/:email", UserController.sendEmailOtp);
userRouter.post("/verify-otp", UserController.VerifyOtp);
userRouter.get("/getHistory", counsellorVerify, UserController.getHistory);
userRouter.get("/getHistoryByAdmin", adminVerify, UserController.getHistory);
userRouter.post("/password-reset-otp", UserController.passwordOtp);
userRouter.post("/verify-password-otp", UserController.VerifyPasswordResetOtp);
userRouter.post("/reset-password", UserController.resetPassword);
userRouter.put(
  "/changeprofile",
  dynamicAuth,
  upload.single("profilePic"),
  UserController.updateUserProfile
);
userRouter.post("/allocate-counsellor", allocateCounsellor);
userRouter.get(
  "/get-user-appointments",
  dynamicAuth,
  UserController.getAppointments
);
