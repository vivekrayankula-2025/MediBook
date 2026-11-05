const logger = require('../utils/logger');
const ApiResponse = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for developers
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, err.stack);

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return ApiResponse.error(res, message, 404);
  }

  // Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    // Specifically handle double booking atomic constraint collision
    if (
      (err.keyPattern && err.keyPattern.doctorId && err.keyPattern['timeSlot.startTime']) ||
      (err.message && err.message.includes('prevent_doctor_slot_double_booking'))
    ) {
      return ApiResponse.error(
        res,
        'This appointment slot is already reserved by another patient. Please select a different time slot.',
        409 // Conflict
      );
    }

    if (err.keyPattern && err.keyPattern.email) {
      return ApiResponse.error(
        res,
        'An account with this email address already exists. Please sign in or use another email.',
        409
      );
    }

    if (err.keyPattern && err.keyPattern.code) {
      return ApiResponse.error(
        res,
        'A department with this code already exists.',
        409
      );
    }

    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return ApiResponse.error(res, `Duplicate value entered for ${field}. It must be unique.`, 409);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return ApiResponse.error(res, 'Validation error occurred', 400, messages);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, 'Invalid token. Please authenticate again.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 'Token has expired. Please log in again.', 401);
  }

  // Default to 500 server error
  return ApiResponse.error(
    res,
    error.message || 'An unexpected internal server error occurred',
    error.statusCode || 500
  );
};

module.exports = errorHandler;
