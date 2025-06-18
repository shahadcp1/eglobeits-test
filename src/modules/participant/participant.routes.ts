import { Router } from 'express';
import { participantController } from './participant.controller';
import { validate } from '../../middleware/validate';
import { body, param } from 'express-validator';

const router = Router();

// Validation rules
const createParticipantRules = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
];

const updateParticipantRules = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
];

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
 *           description: The email of the participant (must be unique)
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
 *         - createdAt
 *         - updatedAt
 */

/**
 * @swagger
 * /api/participants:
 *   get:
 *     summary: Get all participants
 *     tags: [Participants]
 *     responses:
 *       200:
 *         description: List of all participants
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
 *                         $ref: '#/components/schemas/Participant'
 */
router.route('/')
  .get(participantController.findAll.bind(participantController));

/**
 * @swagger
 * /api/participants:
 *   post:
 *     summary: Create a new participant
 *     tags: [Participants]
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
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *     responses:
 *       201:
 *         description: Participant created successfully
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
 *                     participant:
 *                       $ref: '#/components/schemas/Participant'
 *       400:
 *         description: Validation error or email already exists
 *       500:
 *         description: Internal server error
 */
router.route('/')
  .post(validate(createParticipantRules), participantController.create.bind(participantController));

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
 *                   type: object
 *                   properties:
 *                     participant:
 *                       $ref: '#/components/schemas/Participant'
 *       404:
 *         description: Participant not found
 *       400:
 *         description: Invalid participant ID format
 */
router.route('/:id')
  .get(participantController.findOne.bind(participantController));

/**
 * @swagger
 * /api/participants/{id}:
 *   patch:
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
 *                 example: Updated Name
 *               email:
 *                 type: string
 *                 format: email
 *                 example: updated.email@example.com
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
 *                   type: object
 *                   properties:
 *                     participant:
 *                       $ref: '#/components/schemas/Participant'
 *       400:
 *         description: Validation error or email already exists
 *       404:
 *         description: Participant not found
 */
router.route('/:id')
  .patch(validate(updateParticipantRules), participantController.update.bind(participantController));

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
 *       400:
 *         description: Invalid participant ID format
 */
router.route('/:id')
  .delete(participantController.remove.bind(participantController));

export default router;
