import jwt from "jsonwebtoken";
import { User } from "../models/User.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/ApiError.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import config from "../../config/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const dynamicAuth = async (req, res, next) => {
  const authHeaders = req.header("Authorization");
  if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
    return res.status(401).json(new ApiError(401, "No token"));
  }
  const token = authHeaders.split(" ")[1];
  if (!token) {
    return res.status(401).json(new ApiError(401, "No Token Provided"));
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json(new ApiError(401, "Invalid Token Provided"));
  }
};

// only admin middleware
export const adminVerify = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies.authToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res
      .status(401)
      .json(new ApiError(401, "Unauthorized: No Token Provided"));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.JWT_SECRET);
  } catch (err) {
    return res
      .status(401)
      .json(new ApiError(401, "Invalid Token || OR || Token Expired"));
  }

  const user = await User.findById(decoded.userId);
  if (!user || user.role !== "admin") {
    return res
      .status(403)
      .json(new ApiError(403, "Access denied: Admins only"));
  }

  req.user = user; // attach full user to request
  next();
});

// only counsellor middleware
export const counsellorVerify = asyncHandler(async (req, res, next) => {

  const authHeader = req.header("Authorization");
  const token =
    req.cookies.authToken ||
    (authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null);

  if (!token) {
    throw new ApiError(401, "Unauthorized: No token provided");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, config.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findById(decoded.userId);

  if (!user || user.role !== "counsellor") {
    throw new ApiError(403, "Access Denied: Counsellors only");
  }
  req.user = {
    userId: user._id,
    role: user.role,
  };

  next();
});
