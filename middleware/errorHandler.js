const AppError = require("../utils/AppError");

function errorHandler(err, req, res, next) {
  console.error("Error:", {
    message: err.message,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  if (err.code === "23505") {
    return res.status(409).json({
      success: false,
      status: "fail",
      message: "Resource already exists",
    });
  }

  // 22P02: malformed value (e.g. non-UUID id), 22007/22008: bad date
  if (["22P02", "22007", "22008"].includes(err.code)) {
    return res.status(400).json({
      success: false,
      status: "fail",
      message: "Invalid input value",
    });
  }

  if (err.code === "23503") {
    return res.status(400).json({
      success: false,
      status: "fail",
      message: "Referenced resource does not exist",
    });
  }

  return res.status(500).json({
    success: false,
    status: "error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong on the server",
  });
}

module.exports = errorHandler;
