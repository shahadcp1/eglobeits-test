const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('./config/config');
const errorHandler = require('./middlewares/errorHandler');
const eventRoutes = require('./routes/event.routes');
const participantRoutes = require('./routes/participant.routes');
const eventParticipantRoutes = require('./routes/eventParticipant.routes');
const healthRoutes = require('./routes/health.routes');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(config.corsOptions));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Event Management API',
      version: '1.0.0',
      description: 'API for managing events with CRUD operations',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Events', description: 'Event related endpoints' },
      { name: 'Participants', description: 'Participant related endpoints' },
      { name: 'Event Participants', description: 'Event participant management' },
      { name: 'Health', description: 'Health check endpoint' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Routes
app.get('/', (req, res) => {
  res.send('Event Management API is running');
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/events', eventRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api', eventParticipantRoutes); // Event participant routes are already prefixed with /api/...

// Health check route
app.get('/api/health', (req, res) => {
  res.send('API is healthy');
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Not Found',
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
