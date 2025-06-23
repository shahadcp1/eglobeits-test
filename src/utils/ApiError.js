const httpStatus = require('http-status');

/**
 * Extend Node's built-in Error class to create custom API errors
 */
class ApiError extends Error {
  /**
   * Create an API error
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {Array} errors - Array of validation errors
   * @param {boolean} isOperational - Is this a known operational error
   * @param {string} stack - Error stack trace
   */
  constructor(
    statusCode = httpStatus.INTERNAL_SERVER_ERROR,
    message = 'Something went wrong',
    errors = [],
    isOperational = true,
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Create a bad request error
   * @param {string} message - Error message
   * @param {Array} errors - Array of validation errors
   * @returns {ApiError}
   */
  static badRequest(message = 'Bad Request', errors = []) {
    return new ApiError(httpStatus.BAD_REQUEST, message, errors);
  }

  /**
   * Create an unauthorized error
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(httpStatus.UNAUTHORIZED, message);
  }

  /**
   * Create a forbidden error
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static forbidden(message = 'Forbidden') {
    return new ApiError(httpStatus.FORBIDDEN, message);
  }

  /**
   * Create a not found error
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static notFound(message = 'Not Found') {
    return new ApiError(httpStatus.NOT_FOUND, message);
  }

  /**
   * Create a conflict error
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static conflict(message = 'Conflict') {
    return new ApiError(httpStatus.CONFLICT, message);
  }

  /**
   * Create an unprocessable entity error
   * @param {string} message - Error message
   * @param {Array} errors - Array of validation errors
   * @returns {ApiError}
   */
  static unprocessableEntity(message = 'Unprocessable Entity', errors = []) {
    return new ApiError(httpStatus.UNPROCESSABLE_ENTITY, message, errors);
  }

  /**
   * Create an internal server error
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static internalServerError(message = 'Internal Server Error') {
    return new ApiError(httpStatus.INTERNAL_SERVER_ERROR, message);
  }
}

module.exports = ApiError;
