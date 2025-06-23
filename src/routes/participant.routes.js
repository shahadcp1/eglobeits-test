const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participant.controller');
const {
  createParticipantRules,
  updateParticipantRules,
  getParticipantRules,
  deleteParticipantRules,
  listParticipantsRules,
  checkParticipantExists,
  VALIDATION_MESSAGES
} = require('../validators/participant.validator');
const validate = require('../middlewares/validate');
const apiLimiter = require('../middlewares/rateLimiter');

// Apply rate limiting to all participant routes
router.use(apiLimiter);

/**
 * @swagger
 * components:
 *   schemas:
 *     Participant:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - email
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           example: john.doe@example.com
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T00:00:00.000Z
 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 100
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         totalPages:
 *           type: integer
 *           example: 10
 *         hasNextPage:
 *           type: boolean
 *           example: true
 *         hasPreviousPage:
 *           type: boolean
 *           example: false
 *     Error:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *           example: Error message describing the issue
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 example: email
 *               message:
 *                 type: string
 *                 example: Invalid email format
 */

/**
 * @swagger
 * /api/participants:
 *   post:
 *     summary: Create a new participant
 *     description: |
 *       Creates a new participant with the provided details.
 *       Email addresses must be unique across all participants.
 *     tags: [Participants]
 *     security: []
 *     requestBody:
 *       required: true
 *       description: Participant data to create
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
 *                 example: "John Doe"
 *                 description: Full name of the participant
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 255
 *                 example: "john.doe@example.com"
 *                 description: Email address (must be unique)
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
 *                   $ref: '#/components/schemas/Participant'
 *       400:
 *         description: Invalid input data or validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               status: error
 *               message: Validation failed
 *               errors:
 *                 - field: email
 *                   message: This email is already in use
 *       409:
 *         description: Email address is already in use
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
router.post('/', createParticipantRules, validate, participantController.createParticipant);

/**
 * @swagger
 * /api/participants:
 *   get:
 *     summary: Get all participants with pagination and filtering
 *     description: |
 *       Retrieves a paginated list of participants with optional filtering.
 *       Results are sorted by creation date in descending order by default.
 *     tags: [Participants]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page (max 100)
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter participants by name (case-insensitive contains)
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         description: Filter participants by exact email match
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           pattern: '^[a-zA-Z]+:(asc|desc)$'
 *           example: 'name:asc'
 *         description: |
 *           Sort results by field and direction.
 *           Format: `field:direction` where direction is `asc` or `desc`.
 *           Example: `name:asc` or `createdAt:desc`
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
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Invalid query parameters
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
router.get('/', listParticipantsRules, validate, participantController.getParticipants);

/**
 * @swagger
 * /api/participants/{id}:
 *   get:
 *     summary: Get a participant by ID
 *     description: Retrieves detailed information about a specific participant.
 *     tags: [Participants]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique identifier of the participant
 *         example: 123e4567-e89b-12d3-a456-426614174001
 *     responses:
 *       200:
 *         description: Participant details retrieved successfully
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
 *         description: Invalid UUID format
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
router.get('/:id', getParticipantRules, validate, participantController.getParticipant);

/**
 * @swagger
 * /api/participants/{id}:
 *   patch:
 *     summary: Update a participant's information
 *     description: |
 *       Updates one or more fields of an existing participant.
 *       At least one field (name or email) must be provided.
 *       Email addresses must be unique across all participants.
 *     tags: [Participants]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique identifier of the participant to update
 *         example: 123e4567-e89b-12d3-a456-426614174001
 *     requestBody:
 *       required: true
 *       description: Participant data to update (at least one field required)
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "John Updated"
 *                 description: New full name of the participant
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 255
 *                 example: "updated.email@example.com"
 *                 description: New email address (must be unique)
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
 *         description: Invalid input data or validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               status: error
 *               message: Validation failed
 *               errors:
 *                 - field: email
 *                   message: This email is already in use
 *       404:
 *         description: Participant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email address is already in use by another participant
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
router.patch('/:id', updateParticipantRules, validate, participantController.updateParticipant);

/**
 * @swagger
 * /api/participants/{id}:
 *   delete:
 *     summary: Delete a participant
 *     description: |
 *       Permanently deletes a participant and all their associated event participations.
 *       This action cannot be undone.
 *     tags: [Participants]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique identifier of the participant to delete
 *         example: 123e4567-e89b-12d3-a456-426614174001
 *     responses:
 *       204:
 *         description: Participant deleted successfully
 *         content:
 *           application/json:
 *             example: ""
 *       400:
 *         description: Invalid UUID format
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
router.delete('/:id', deleteParticipantRules, validate, participantController.deleteParticipant);

module.exports = router;
