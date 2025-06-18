import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Health check endpoint for load balancers and monitoring
 * @route GET /health
 */
export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Simple health check script for Docker healthcheck
 */
if (require.main === module) {
  import('http')
    .then((http) => {
      const port = process.env.PORT || 3000;
      http
        .request(`http://localhost:${port}/health`, { method: 'GET' })
        .on('error', () => process.exit(1))
        .on('response', (res) => {
          if (res.statusCode === 200) {
            process.exit(0);
          } else {
            console.error(`Health check failed with status: ${res.statusCode}`);
            process.exit(1);
          }
        })
        .end();
    })
    .catch((error) => {
      console.error('Health check failed:', error);
      process.exit(1);
    });
}
