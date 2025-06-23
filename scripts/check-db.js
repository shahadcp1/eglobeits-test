const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const { execSync } = require('child_process');

// Load environment variables from .env file
dotenv.config();

const prisma = new PrismaClient();

/**
 * Check if the database is reachable and the required tables exist
 */
async function checkDatabaseConnection() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Check if database is reachable
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    
    // Check if required tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    const tableNames = tables.map(t => t.table_name);
    console.log('📊 Found tables:', tableNames.join(', '));
    
    if (!tableNames.includes('Event')) {
      console.warn('⚠️  Warning: Event table not found. Running migrations...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkDatabaseConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  });
