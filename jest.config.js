module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/.jest/setup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  verbose: true,
  testTimeout: 30000,
  // Disable global setup/teardown for now as they're causing issues
  // globalSetup: '<rootDir>/jest.global-setup.js',
  // globalTeardown: '<rootDir>/jest.global-teardown.js',
  // Add module name mapper for mocking
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Enable ES modules support
  transform: {},
  // Reset mocks between tests
  resetMocks: true,
  clearMocks: true,
  // Add setup for environment
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
}
