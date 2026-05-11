const AppError = require("..utils/AppError");
function errorHandler(err, req, res, next) {
  let error = err;

  console.error("Error:", {
    message: err.message,
    statusCode: err.statusCode,
  });
}
