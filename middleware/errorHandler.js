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

  // Errors raised by express.json() before any route runs
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      status: "fail",
      message: "Request body is not valid JSON",
    });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      status: "fail",
      message: "Request body is too large",
    });
  }

  // Other client errors raised by Express/body-parser (bad percent-encoding in
  // a path, unsupported Content-Encoding, ...) already carry their 4xx status
  const clientStatus = err.status ?? err.statusCode;
  if (Number.isInteger(clientStatus) && clientStatus >= 400 && clientStatus < 500) {
    return res.status(clientStatus).json({
      success: false,
      status: "fail",
      message: err.expose ? err.message : "Bad request",
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
