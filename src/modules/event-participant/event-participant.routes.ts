import { Router } from 'express';
import { eventParticipantController } from './event-participant.controller';
import { validate } from '../../middleware/validate';
import { body, param } from 'express-validator';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     EventParticipant:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The unique identifier for the event-participant relationship
 *         eventId:
 *           type: string
 *           format: uuid
 *           description: The ID of the event
 *         participantId:
 *           type: string
 *           format: uuid
 *           description: The ID of the participant
 *         registeredAt:
 *           type: string
 *           format: date-time
 *           description: The date when the participant registered for the event
 *         participant:
 *           $ref: '#/components/schemas/Participant'
 */

/**
 * @swagger
 * /api/events/{eventId}/participants:
 *   post:
 *     summary: Add a participant to an event
 *     tags: [Event Participants]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participantId
 *             properties:
 *               participantId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the participant to add to the event
 *     responses:
 *       201:
 *         description: Participant added to event successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     registration:
 *                       $ref: '#/components/schemas/EventParticipant'
 *       400:
 *         description: Validation error or event is full
 *       404:
 *         description: Event or participant not found
 *       409:
 *         description: Participant is already registered for this event
 */
router.post(
  '/:eventId/participants',
  [
    param('eventId').isUUID().withMessage('Valid event ID is required'),
    body('participantId').isUUID().withMessage('Valid participant ID is required'),
    validate,
  ],
  eventParticipantController.addParticipant.bind(eventParticipantController)
);

/**
 * @swagger
 * /api/events/{eventId}/participants/{participantId}:
 *   delete:
 *     summary: Remove a participant from an event
 *     tags: [Event Participants]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the event
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the participant to remove from the event
 *     responses:
 *       204:
 *         description: Participant removed from event successfully
 *       404:
 *         description: Event, participant, or registration not found
 *       400:
 *         description: Invalid event or participant ID format
 */
router.delete(
  '/:eventId/participants/:participantId',
  [
    param('eventId').isUUID().withMessage('Valid event ID is required'),
    param('participantId').isUUID().withMessage('Valid participant ID is required'),
    validate,
  ],
  eventParticipantController.removeParticipant.bind(eventParticipantController)
);

/**
 * @swagger
 * /api/events/{eventId}/participants:
 *   get:
 *     summary: Get all participants for an event
 *     tags: [Event Participants]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the event
 *     responses:
 *       200:
 *         description: List of participants for the event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 1
 *                 data:
 *                   type: object
 *                   properties:
 *                     participants:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/EventParticipant'
 *       404:
 *         description: Event not found
 *       400:
 *         description: Invalid event ID format
 */
router.get(
  '/:eventId/participants',
  [
    param('eventId').isUUID().withMessage('Valid event ID is required'),
    validate,
  ],
  eventParticipantController.getParticipants.bind(eventParticipantController)
);

export default router;
