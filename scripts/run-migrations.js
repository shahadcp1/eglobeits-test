const { execSync } = require('child_process');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

console.log('Running database migrations...');

try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('Migrations applied successfully!');
} catch (error) {
  console.error('Error running migrations:', error);
  process.exit(1);
}
