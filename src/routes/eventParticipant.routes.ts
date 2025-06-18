import { Router } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { AddParticipantDto } from '../dto/participant.dto';
import * as eventParticipantController from '../controllers/eventParticipant.controller';

const router = Router();

// Add participant to event
router.post(
  '/:eventId/participants',
  [
    param('eventId').isUUID().withMessage('Valid event ID is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    validateRequest,
  ],
  eventParticipantController.addParticipant
);

// Remove participant from event
router.delete(
  '/:eventId/participants/:participantId',
  [
    param('eventId').isUUID().withMessage('Valid event ID is required'),
    param('participantId').isUUID().withMessage('Valid participant ID is required'),
    validateRequest,
  ],
  eventParticipantController.removeParticipant
);

// Get all participants for an event
router.get(
  '/:eventId/participants',
  [
    param('eventId').isUUID().withMessage('Valid event ID is required'),
    validateRequest,
  ],
  eventParticipantController.getParticipants
);

export default router;
