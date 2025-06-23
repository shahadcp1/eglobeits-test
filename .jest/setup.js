// Simple Jest setup file

// Set default timeout for tests to 10 seconds
jest.setTimeout(10000);

// Mock console methods to clean up test output
const originalConsole = {
  error: console.error,
  warn: console.warn,
  log: console.log,
};

// Only set up mocks if we're in a test environment
if (process.env.NODE_ENV === 'test') {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Suppress console output during tests
    console.error = jest.fn();
    console.warn = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    // Restore original console methods
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.log = originalConsole.log;
  });
}
