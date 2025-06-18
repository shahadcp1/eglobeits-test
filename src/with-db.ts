import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import eventRoutes from './routes/event.routes';
import participantRoutes from './modules/participant/participant.routes';

// Load environment variables from .env file in the project root
const envPath = path.resolve(process.cwd(), '.env');
console.log(`Loading environment variables from: ${envPath}`);
const result = dotenv.config({ path: envPath });

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Event Management API',
      version: '1.0.0',
      description: 'API for managing events and participants',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/modules/**/*.routes.ts',
  ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('Environment variables loaded successfully');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '***' : 'Not set');
}

// Create Express app
const app = express();

// Initialize Prisma Client
const prisma = new PrismaClient();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Add Prisma to request object
app.use((req: any, res, next) => {
  req.prisma = prisma;
  next();
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  explorer: true,
  customSiteTitle: 'Event Management API',
  customCss: `
    .swagger-ui .topbar { background-color: #1a1a1a; }
    .swagger-ui .info .title { color: #3b4151; }
    .swagger-ui .opblock-tag {
      margin: 0 0 10px 0;
      padding: 10px;
      background: #f8f8f8;
      border-radius: 4px;
    }
  `
}));

// API Routes
app.use('/api/events', eventRoutes);
app.use('/api/participants', participantRoutes);

// Log Swagger docs URL
console.log(`API Documentation available at http://localhost:${process.env.PORT || 3000}/api-docs`);

// Simple route
app.get('/', (req, res) => {
  res.json({ message: 'API is running with database' });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Events API available at http://localhost:${PORT}/api/events`);
});

// Handle graceful shutdown
const shutdown = async () => {
  console.log('Shutting down server...');
  server.close(async () => {
    console.log('Server closed');
    await prisma.$disconnect();
    console.log('Database connection closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
