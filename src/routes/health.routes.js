const express = require('express');
const router = express.Router();
const { healthCheck } = require('../controllers/health.controller');

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Uptime in seconds
 *                 database:
 *                   type: string
 *                   enum: [connected, disconnected]
 *                 memoryUsage:
 *                   type: object
 *                   properties:
 *                     rss:
 *                       type: number
 *                     heapTotal:
 *                       type: number
 *                     heapUsed:
 *                       type: number
 *                     external:
 *                       type: number
 *                     arrayBuffers:
 *                       type: number
 *       503:
 *         description: Service Unavailable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Service Unavailable
 *                 database:
 *                   type: string
 *                   enum: [disconnected]
 *                 error:
 *                   type: string
 *                   description: Error message
 */
router.get('/', healthCheck);

module.exports = router;
