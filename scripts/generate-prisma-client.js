const { execSync } = require('child_process');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

console.log('Generating Prisma client...');

try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma client generated successfully!');
} catch (error) {
  console.error('Error generating Prisma client:', error);
  process.exit(1);
}
