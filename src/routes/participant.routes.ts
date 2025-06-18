import { Router } from 'express';
import * as participantController from '../controllers/participant.controller';
import { validate } from '../middleware/validate';
import {
  createParticipantValidator,
  updateParticipantValidator,
  participantIdValidator,
  eventIdValidator,
} from '../middleware/validators/participant.validator';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Participant:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The unique identifier for the participant
 *         name:
 *           type: string
 *           description: The name of the participant
 *         email:
 *           type: string
 *           format: email
 *           description: The email of the participant (unique per event)
 *         eventId:
 *           type: string
 *           format: uuid
 *           description: The ID of the event this participant is registered for
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date when the participant was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date when the participant was last updated
 *       required:
 *         - id
 *         - name
 *         - email
 *         - eventId
 *         - createdAt
 *         - updatedAt
 */

/**
 * @swagger
 * /api/events/{eventId}/participants:
 *   post:
 *     summary: Register a new participant for an event
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the event to register for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Participant registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Participant'
 *       400:
 *         description: Validation error or event is full
 *       404:
 *         description: Event not found
 *       409:
 *         description: Email already registered for this event
 */
router.post(
  '/:eventId/participants',
  validate(eventIdValidator),
  validate(createParticipantValidator),
  participantController.createParticipant
);

/**
 * @swagger
 * /api/events/{eventId}/participants:
 *   get:
 *     summary: Get all participants for an event with pagination
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the event
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of participants with pagination info
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
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPreviousPage:
 *                       type: boolean
 *       404:
 *         description: Event not found
 */
router.get(
  '/:eventId/participants',
  validate(eventIdValidator),
  participantController.getParticipants
);

/**
 * @swagger
 * /api/participants/{id}:
 *   get:
 *     summary: Get a participant by ID
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Participant ID
 *     responses:
 *       200:
 *         description: Participant details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Participant'
 *       404:
 *         description: Participant not found
 */
router.get(
  '/participants/:id',
  validate(participantIdValidator),
  participantController.getParticipant
);

/**
 * @swagger
 * /api/participants/{id}:
 *   put:
 *     summary: Update a participant
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Participant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Participant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Participant'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Participant not found
 *       409:
 *         description: Email already registered for this event
 */
router.put(
  '/participants/:id',
  validate(participantIdValidator),
  validate(updateParticipantValidator),
  participantController.updateParticipant
);

/**
 * @swagger
 * /api/participants/{id}:
 *   delete:
 *     summary: Delete a participant
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Participant ID
 *     responses:
 *       204:
 *         description: Participant deleted successfully
 *       404:
 *         description: Participant not found
 */
router.delete(
  '/participants/:id',
  validate(participantIdValidator),
  participantController.checkParticipantExistence,
  participantController.deleteParticipant
);

export default router;
