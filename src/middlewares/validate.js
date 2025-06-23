const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

/**
 * Middleware to validate request data against validation rules
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (errors.isEmpty()) {
    return next();
  }

  // Format errors
  const formattedErrors = errors.array().map(error => ({
    field: error.param,
    message: error.msg,
    value: error.value
  }));

  // Use the static method from ApiError for consistency
  next(ApiError.badRequest('Validation failed', formattedErrors));
};

module.exports = validate;
