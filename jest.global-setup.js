const { execSync } = require('child_process');

module.exports = async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://postgres:string!123@localhost:5432/event_management_api_test?schema=public';

  try {
    // Create test database if it doesn't exist
    execSync('npx prisma migrate reset --force --skip-generate', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to set up test database:', error);
    process.exit(1);
  }
};
