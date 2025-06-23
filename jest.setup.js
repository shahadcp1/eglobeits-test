// Global test setup
beforeEach(async () => {
  // Reset the database before each test
  const { execSync } = require('child_process');
  execSync('npx prisma migrate reset --force --skip-generate', { stdio: 'inherit' });
});

afterAll(async () => {
  // Close any open handles or connections
  const { execSync } = require('child_process');
  execSync('npx prisma migrate reset --force --skip-generate', { stdio: 'inherit' });
});
