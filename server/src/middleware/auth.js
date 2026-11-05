const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

/**
 * Protect routes - Verifies JWT Bearer token
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return ApiResponse.error(
      res,
      'Access denied. No authentication token provided.',
      401
    );
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'medibook_super_secret_jwt_key_2026_final_year_project_secure'
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return ApiResponse.error(res, 'The user belonging to this token no longer exists.', 401);
    }

    if (!user.isActive) {
      return ApiResponse.error(res, 'This user account has been deactivated.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    return ApiResponse.error(res, 'Invalid or expired authentication token.', 401);
  }
};

/**
 * Role-Based Access Control (RBAC) middleware
 * @param  {...string} roles Allowed roles ('patient', 'doctor', 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Forbidden: Role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this resource.`,
        403
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
