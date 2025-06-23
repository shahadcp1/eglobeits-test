const { PrismaClient } = require('@prisma/client');
const faker = require('faker');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.event.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // Create sample events
  const events = Array.from({ length: 20 }, (_, i) => ({
    title: `Event ${i + 1}: ${faker.lorem.words(3)}`,
    description: faker.lorem.paragraphs(2),
    eventDate: faker.date.future(1, new Date()),
    capacity: faker.datatype.number({ min: 10, max: 500 }),
  }));

  await prisma.event.createMany({
    data: events,
  });

  console.log(`✅ Created ${events.length} events`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
