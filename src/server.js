const fs = require('fs');
const path = require('path');
const app = require('./app');
const config = require('./config/config');
const prisma = require('./config/prisma');
const { execSync } = require('child_process');

// Load environment variables
require('dotenv').config();

// Ensure logs directory exists
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create a write stream for logging
const logStream = fs.createWriteStream(
  path.join(logDir, 'server.log'),
  { flags: 'a' }
);

// Override console.log to write to both console and file
const originalConsoleLog = console.log;
console.log = function() {
  const message = Array.from(arguments).join(' ');
  originalConsoleLog.apply(console, arguments);
  logStream.write(`[${new Date().toISOString()}] ${message}\n`);
};

// Override console.error to write to both console and file
const originalConsoleError = console.error;
console.error = function() {
  const message = Array.from(arguments).join(' ');
  originalConsoleError.apply(console, arguments);
  logStream.write(`[${new Date().toISOString()}] ERROR: ${message}\n`);
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('\n❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

/**
 * Check if the database is reachable and has the required tables
 */
async function checkDatabase() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check if events table exists (case-sensitive check)
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'events'
    `;
    
    if (tables.length === 0) {
      console.warn('⚠️  Event table not found. Running migrations...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    return false;
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('\n❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  
  // Attempt to gracefully close the server and database connection
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

let server;

/**
 * Start the server
 */
async function startServer() {
  try {
    // Check database connection and schema
    console.log('🔍 Checking database connection...');
    const dbReady = await checkDatabase();
    
    if (!dbReady) {
      throw new Error('Database connection or schema check failed');
    }
    
    console.log('✅ Database connection established');
    
    // Start the server
    const port = config.port || 3001; // Use config port or default to 3001
    server = app.listen(port, () => {
      console.log(`\n🚀 Server running on port ${port}`);
      console.log(`📚 API Documentation available at http://localhost:${port}/api-docs`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
    
    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('\n❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle termination signals
const shutdown = async (signal) => {
  console.log(`\n${signal} signal received. Shutting down gracefully...`);
  
  try {
    // Close the server
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    
    // Disconnect from database
    await prisma.$disconnect();
    console.log('👋 Database connection closed');
    
    console.log('💤 Process terminated');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle different termination signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start the application
startServer().catch((error) => {
  console.error('Fatal error during startup:', error);
  process.exit(1);
});
