import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: function (req, res) {
    res
      .status(429)
      .json(new ApiError(429, "Too many requests, please try again later."));
  },
});
