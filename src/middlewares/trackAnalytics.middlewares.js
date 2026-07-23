import { PageAnalytics } from "../models/PageAnalytics.model.js";
import { asyncHandler } from "../utils/async-handler.js";

export const trackAnalytics = asyncHandler(async (req, res, next) => {
  const url = req.originalUrl;

  // 🚫 Excluded routes
  const excludedRoutes = [
    "/api/user/login",
    "/api/user/signup",
    "/analytics/track",
    "/favicon.ico",
  ];

  if (url.startsWith("/admin") || excludedRoutes.includes(url)) {
    return next();
  }

  await PageAnalytics.create({
    page: url,
    userId: req.user?.id || null,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });
  next();
});
