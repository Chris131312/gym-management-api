const { ForbiddenError } = require("../utils/errors");

const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ForbiddenError("Access denied");
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Role '${req.user.role}' does not have permission for this action`,
      );
    }

    next();
  };
};

module.exports = restrictTo;
