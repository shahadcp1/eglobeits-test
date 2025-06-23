const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');

// Validation rules for creating an event
exports.createEventValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title cannot be longer than 255 characters'),
    
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required'),
    
  body('eventDate')
    .notEmpty().withMessage('Event date is required')
    .isISO8601().withMessage('Invalid date format. Use ISO8601 format (e.g., 2023-12-31T23:59:59Z)')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Event date must be in the future');
      }
      return true;
    }),
    
  body('capacity')
    .isInt({ min: 1 }).withMessage('Capacity must be a positive integer')
    .toInt()
];

// Validation rules for updating an event
exports.updateEventValidation = [
  param('id')
    .isUUID().withMessage('Invalid event ID'),
    
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 255 }).withMessage('Title cannot be longer than 255 characters'),
    
  body('description')
    .optional()
    .trim()
    .notEmpty().withMessage('Description cannot be empty'),
    
  body('eventDate')
    .optional()
    .isISO8601().withMessage('Invalid date format. Use ISO8601 format (e.g., 2023-12-31T23:59:59Z)')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Event date must be in the future');
      }
      return true;
    }),
    
  body('capacity')
    .optional()
    .isInt({ min: 1 }).withMessage('Capacity must be a positive integer')
    .toInt()
];

// Validation rules for getting events with pagination
exports.getEventsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
    
  query('sortBy')
    .optional()
    .isIn(['title', 'eventDate', 'createdAt', 'capacity']).withMessage('Invalid sort field'),
    
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Sort order must be either "asc" or "desc"')
];

// Middleware to handle validation errors
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};
