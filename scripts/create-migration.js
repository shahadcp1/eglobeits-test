const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter migration name: ', (name) => {
  try {
    console.log('Creating migration...');
    execSync(`npx prisma migrate dev --name ${name} --create-only`, { stdio: 'inherit' });
    console.log('Migration created successfully!');
  } catch (error) {
    console.error('Error creating migration:', error);
  } finally {
    rl.close();
  }
});
