const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const prisma = new PrismaClient();

async function setupTestDatabase() {
  try {
    console.log('Setting up test database...');
    
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set in the environment variables');
    }

    // Check if we're using the test database
    if (!process.env.DATABASE_URL.includes('test')) {
      throw new Error('Not using a test database. Please set DATABASE_URL to a test database.');
    }

    // Reset the database
    console.log('Resetting test database...');
    await prisma.$executeRaw`DROP SCHEMA IF EXISTS public CASCADE`;
    await prisma.$executeRaw`CREATE SCHEMA public`;
    await prisma.$executeRaw`GRANT ALL ON SCHEMA public TO postgres`;
    await prisma.$executeRaw`GRANT ALL ON SCHEMA public TO public`;

    // Apply migrations
    console.log('Applying migrations...');
    const { execSync } = require('child_process');
    execSync('npx prisma migrate dev --name init --skip-generate', { stdio: 'inherit' });

    console.log('Test database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestDatabase();
