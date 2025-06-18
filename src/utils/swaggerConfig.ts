import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

// Configure Swagger options
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Event Management API',
      version: '1.0.0',
      description: 'API for managing events and participants',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Participants',
        description: 'Operations about participants',
      },
      {
        name: 'Events',
        description: 'Operations about events',
      },
      {
        name: 'Event Participants',
        description: 'Operations about event participants',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in the format: Bearer <token>',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
        },
        BadRequest: {
          description: 'Bad request. Please check your input data.',
        },
        NotFound: {
          description: 'The requested resource was not found.',
        },
        InternalServerError: {
          description: 'Internal server error. Please try again later.',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/modules/participant/participant.routes.ts',
    './src/modules/event-participant/event-participant.routes.ts',
    './src/routes/event.routes.ts',
  ],
  // Only include route files directly to avoid parsing issues
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

const swaggerUiOptions = {
  explorer: true,
  customSiteTitle: 'Event Management API',
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b4151; }
    .swagger-ui .opblock-tag {
      margin: 0 0 10px 0;
      padding: 10px;
      background: #f8f8f8;
      border-radius: 4px;
    }
    .swagger-ui .opblock {
      margin-bottom: 15px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }
    .swagger-ui .opblock .opblock-summary-method {
      min-width: 80px;
      text-align: center;
    }
    .swagger-ui .info {
      margin: 20px 0;
    }
  `,
  customSiteTitle: 'Event Management API Documentation',
  customfavIcon: '/favicon.ico',
};

export const setupSwagger = (app: Express): void => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerUiOptions)
  );

  // API JSON endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`API Documentation available at http://localhost:${process.env.PORT || 3000}/api-docs`);
};

export default swaggerSpec;
