const AppError = require("./AppError");

class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = "Validation failed", details = null) {
    super(message, 400);
    this.details = details;
  }
}

class ConflictError extends AppError {
    constructor(message = "Resource already exists") {
        super(message, 409)
    }
}

class UnauthorizedError extends AppError {
    constructor(message = "Authentication required") {
        super(message, 401)
    }
}

class ForbiddenError extends AppError {
    constructor(message = "Access denied") {
        super(message, 403)
    }
}

module.exports = {
    NotFoundError,
    ValidationError,
    ConflictError,
    UnauthorizedError,
    ForbiddenError,
}
