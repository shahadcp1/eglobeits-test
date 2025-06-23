const express = require('express');
const router = express.Router();
const eventParticipantController = require('../controllers/eventParticipant.controller');
const eventParticipantValidator = require('../validators/eventParticipant.validator');
const validate = require('../middlewares/validate');
const apiLimiter = require('../middlewares/rateLimiter');

// Apply rate limiting to all routes
router.use(apiLimiter);

/**
 * @swagger
 * /api/events/{eventId}/participants/{participantId}:
 *   post:
 *     summary: Register a participant to an event
 *     tags: [Event Participants]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the event to register for
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the participant to register
 *         example: 123e4567-e89b-12d3-a456-426614174001
 *     responses:
 *       201:
 *         description: Participant registered to event successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/EventParticipant'
 *       400:
 *         description: Invalid input, validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Event or participant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Participant already registered to this event or event is at capacity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/events/:eventId/participants/:participantId',
  eventParticipantValidator.registerParticipantRules,
  validate,
  eventParticipantController.registerParticipant
);

/**
 * @swagger
 * /api/events/{eventId}/participants/{participantId}:
 *   delete:
 *     summary: Remove a participant from an event
 *     tags: [Event Participants]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the event
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the participant to remove
 *         example: 123e4567-e89b-12d3-a456-426614174001
 *     responses:
 *       204:
 *         description: Participant removed from event successfully
 *       400:
 *         description: Invalid input, validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Registration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/events/:eventId/participants/:participantId',
  eventParticipantValidator.removeParticipantRules,
  validate,
  eventParticipantController.removeParticipant
);

/**
 * @swagger
 * /api/events/{eventId}/participants:
 *   get:
 *     summary: Get all participants for an event
 *     tags: [Event Participants]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the event
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page (max 100)
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Participant'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Invalid input, validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/events/:eventId/participants',
  eventParticipantValidator.getEventParticipantsRules,
  validate,
  eventParticipantController.getEventParticipants
);

/**
 * @swagger
 * /api/participants/{participantId}/events:
 *   get:
 *     summary: Get all events for a participant
 *     tags: [Event Participants]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the participant
 *         example: 123e4567-e89b-12d3-a456-426614174001
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page (max 100)
 *     responses:
 *       200:
 *         description: List of events for the participant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Invalid input, validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Participant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/participants/:participantId/events',
  eventParticipantValidator.getParticipantEventsRules,
  validate,
  eventParticipantController.getParticipantEvents
);

module.exports = router;
