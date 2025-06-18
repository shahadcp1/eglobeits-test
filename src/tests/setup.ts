import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { beforeEach, afterAll } from '@jest/globals';

// Load environment variables
dotenv.config({ path: '../../.env.test' });

// Create a new Prisma client for testing
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'test' ? [] : ['query', 'info', 'warn', 'error'],
});

// Clean up the database before each test
beforeEach(async () => {
  await prisma.participant.deleteMany({});
  await prisma.event.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Export the Prisma client for use in tests
export { prisma };
