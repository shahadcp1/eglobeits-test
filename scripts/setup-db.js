const { execSync } = require('child_process');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

console.log('🚀 Setting up database...');

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL is not set in the environment variables');
  process.exit(1);
}

try {
  // Run database migrations
  console.log('🔄 Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  // Generate Prisma Client
  console.log('⚡ Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Seed the database if in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('🌱 Seeding database with sample data...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      // Clear existing data
      await prisma.event.deleteMany({});
      console.log('🗑️  Cleared existing data');

      // Create sample events
      const { faker } = require('@faker-js/faker');
      const events = Array.from({ length: 10 }, (_, i) => ({
        title: `Event ${i + 1}: ${faker.lorem.words(3)}`,
        description: faker.lorem.paragraphs(2),
        eventDate: faker.date.future(1, new Date()),
        capacity: faker.datatype.number({ min: 10, max: 500 }),
      }));

      await prisma.event.createMany({
        data: events,
      });

      console.log(`✅ Created ${events.length} sample events`);
    } catch (error) {
      console.error('Error seeding database:', error);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  }

  console.log('✨ Database setup completed successfully!');
} catch (error) {
  console.error('❌ Error setting up database:', error);
  process.exit(1);
}
