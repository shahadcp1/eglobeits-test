const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
const healthCheck = async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      memoryUsage: process.memoryUsage(),
      env: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      message: 'Service Unavailable',
      database: 'disconnected',
      error: error.message,
    });
  }
};

module.exports = { healthCheck };
