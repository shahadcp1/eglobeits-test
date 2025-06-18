import { body, param } from 'express-validator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createParticipantValidator = [
  param('eventId').isUUID().withMessage('Invalid event ID'),
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
    .custom(async (email, { req }) => {
      const eventId = req.params.eventId;
      const existingParticipant = await prisma.participant.findFirst({
        where: {
          email,
          eventId,
        },
      });
      if (existingParticipant) {
        throw new Error('Email is already registered for this event');
      }
      return true;
    }),
];

export const updateParticipantValidator = [
  param('id').isUUID().withMessage('Invalid participant ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
    .custom(async (email, { req }) => {
      const participantId = req.params.id;
      
      // Find the participant to get the event ID
      const participant = await prisma.participant.findUnique({
        where: { id: participantId },
        select: { eventId: true },
      });

      if (!participant) {
        throw new Error('Participant not found');
      }

      // Check if email is already used by another participant in the same event
      const existingParticipant = await prisma.participant.findFirst({
        where: {
          email,
          eventId: participant.eventId,
          NOT: {
            id: participantId,
          },
        },
      });

      if (existingParticipant) {
        throw new Error('Email is already registered for this event');
      }
      return true;
    }),
];

export const participantIdValidator = [
  param('id').isUUID().withMessage('Invalid participant ID'),
];

export const eventIdValidator = [
  param('eventId').isUUID().withMessage('Invalid event ID'),
];
