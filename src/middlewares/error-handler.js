export function errorHandler(err, req, res, next) {
  console.error("=== [ERROR] ===\n", err);
  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: err.errors,
    });
  }

  const statusCode = err.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
}
