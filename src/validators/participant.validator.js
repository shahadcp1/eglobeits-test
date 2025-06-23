const { body, param, query } = require('express-validator');
const prisma = require('../config/prisma');
const { isISO8601 } = require('validator');

// Common validation messages
const VALIDATION_MESSAGES = {
  REQUIRED: (field) => `${field} is required`,
  INVALID_EMAIL: 'Please provide a valid email address',
  INVALID_UUID: 'Invalid ID format. Must be a valid UUID',
  NAME_LENGTH: 'Name must be between 2 and 100 characters',
  EMAIL_IN_USE: 'This email is already in use',
  INVALID_PAGE: 'Page must be a positive integer',
  INVALID_LIMIT: 'Limit must be between 1 and 100',
  INVALID_DATE: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)'
};

// Validation rules for creating a participant
const createParticipantRules = [
  // Name validation
  body('name')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.REQUIRED('Name'))
    .isLength({ min: 2, max: 100 })
    .withMessage(VALIDATION_MESSAGES.NAME_LENGTH)
    .matches(/^[\p{L}\s'-]+$/u)
    .withMessage('Name contains invalid characters'),
  
  // Email validation
  body('email')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.REQUIRED('Email'))
    .isEmail()
    .withMessage(VALIDATION_MESSAGES.INVALID_EMAIL)
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters')
    .custom(async (email) => {
      const existingParticipant = await prisma.participant.findUnique({
        where: { email },
        select: { id: true }
      });
      if (existingParticipant) {
        throw new Error(VALIDATION_MESSAGES.EMAIL_IN_USE);
      }
      return true;
    })
];

// Validation rules for updating a participant
const updateParticipantRules = [
  // ID validation
  param('id')
    .isUUID(4)
    .withMessage(VALIDATION_MESSAGES.INVALID_UUID),
    
  // Name validation (optional)
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage(VALIDATION_MESSAGES.NAME_LENGTH)
    .matches(/^[\p{L}\s'-]+$/u)
    .withMessage('Name contains invalid characters'),
    
  // Email validation (optional)
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage(VALIDATION_MESSAGES.INVALID_EMAIL)
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters')
    .custom(async (email, { req }) => {
      const existingParticipant = await prisma.participant.findFirst({
        where: {
          email,
          NOT: { id: req.params.id }
        },
        select: { id: true }
      });
      
      if (existingParticipant) {
        throw new Error(VALIDATION_MESSAGES.EMAIL_IN_USE);
      }
      return true;
    })
    
  // At least one field to update
    .custom((_, { req }) => {
      if (!req.body.name && !req.body.email) {
        throw new Error('At least one field (name or email) must be provided for update');
      }
      return true;
    })
];

// Validation rules for getting a list of participants
const listParticipantsRules = [
  // Pagination
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage(VALIDATION_MESSAGES.INVALID_PAGE)
    .toInt(),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage(VALIDATION_MESSAGES.INVALID_LIMIT)
    .toInt(),
    
  // Filtering
  query('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search name must be between 1 and 100 characters'),
    
  query('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage(VALIDATION_MESSAGES.INVALID_EMAIL)
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters'),
    
  // Sorting (example: ?sortBy=createdAt:desc)
  query('sortBy')
    .optional()
    .matches(/^[a-zA-Z]+:(asc|desc)$/)
    .withMessage('Invalid sort format. Use: field:asc or field:desc')
];

// Validation rules for getting a single participant
const getParticipantRules = [
  param('id')
    .isUUID(4)
    .withMessage(VALIDATION_MESSAGES.INVALID_UUID)
];

// Validation rules for deleting a participant
const deleteParticipantRules = [
  param('id')
    .isUUID(4)
    .withMessage(VALIDATION_MESSAGES.INVALID_UUID)
];

// Validation rules for checking participant existence
const checkParticipantExists = [
  param('participantId')
    .isUUID(4)
    .withMessage(VALIDATION_MESSAGES.INVALID_UUID)
    .custom(async (participantId) => {
      const participant = await prisma.participant.findUnique({
        where: { id: participantId },
        select: { id: true }
      });
      
      if (!participant) {
        throw new Error('Participant not found');
      }
      return true;
    })
];

module.exports = {
  createParticipantRules,
  updateParticipantRules,
  getParticipantRules,
  deleteParticipantRules,
  listParticipantsRules,
  checkParticipantExists,
  VALIDATION_MESSAGES
};
