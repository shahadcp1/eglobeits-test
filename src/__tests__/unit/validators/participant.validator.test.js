// Simple test setup without Jest globals
const { validationResult } = require('express-validator');

// Mock Prisma client
const mockPrisma = {
  participant: {
    findUnique: jest.fn(),
    findFirst: jest.fn()
  },
  $disconnect: jest.fn()
};

// Mock the Prisma client
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => mockPrisma)
  };
});

// Import the validators after mocking Prisma
const {
  createParticipantRules,
  updateParticipantRules,
  listParticipantsRules,
  getParticipantRules,
  deleteParticipantRules,
  checkParticipantExists,
  VALIDATION_MESSAGES
} = require('../../../../src/validators/participant.validator');

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('Participant Validator', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup mock request, response and next function
    mockReq = {
      body: {},
      params: {},
      query: {}
    };
    mockRes = {};
    mockNext = jest.fn();
    
    // Reset the mockPrisma
    mockPrisma.participant.findUnique.mockReset();
    mockPrisma.participant.findFirst.mockReset();
  });

  // Helper function to run validation middleware
  const runValidation = async (rules, req = mockReq) => {
    await Promise.all(rules.map(validation => validation.run(req)));
    const errors = validationResult(req);
    return errors;
  };

  describe('createParticipantRules', () => {
    it('should pass validation with valid input', async () => {
      mockReq.body = {
        name: 'John Doe',
        email: 'john.doe@example.com'
      };
      
      mockPrisma.participant.findUnique.mockResolvedValue(null);
      
      const errors = await runValidation(createParticipantRules);
      expect(errors.isEmpty()).toBe(true);
      expect(mockPrisma.participant.findUnique).toHaveBeenCalledWith({
        where: { email: 'john.doe@example.com' },
        select: { id: true }
      });
    });

    it('should fail if name is missing', async () => {
      mockReq.body = {
        email: 'john.doe@example.com'
      };
      
      const errors = await runValidation(createParticipantRules);
      expect(errors.array()).toHaveLength(1);
      expect(errors.array()[0].msg).toBe(VALIDATION_MESSAGES.REQUIRED('Name'));
    });

    it('should fail if name is too short', async () => {
      mockReq.body = {
        name: 'J',
        email: 'john.doe@example.com'
      };
      
      const errors = await runValidation(createParticipantRules);
      expect(errors.array()[0].msg).toBe(VALIDATION_MESSAGES.NAME_LENGTH);
    });

    it('should fail if email is invalid', async () => {
      mockReq.body = {
        name: 'John Doe',
        email: 'invalid-email'
      };
      
      const errors = await runValidation(createParticipantRules);
      expect(errors.array()[0].msg).toBe(VALIDATION_MESSAGES.INVALID_EMAIL);
    });

    it('should fail if email is already in use', async () => {
      mockReq.body = {
        name: 'John Doe',
        email: 'existing@example.com'
      };
      
      mockPrisma.participant.findUnique.mockResolvedValue({ id: '123' });
      
      const errors = await runValidation(createParticipantRules);
      expect(errors.array()[0].msg).toBe(VALIDATION_MESSAGES.EMAIL_IN_USE);
      expect(mockPrisma.participant.findUnique).toHaveBeenCalledWith({
        where: { email: 'existing@example.com' },
        select: { id: true }
      });
    });
  });

  describe('updateParticipantRules', () => {
    beforeEach(() => {
      // Set up default params for all update tests
      mockReq.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      // Reset mock implementation
      mockPrisma.participant.findFirst.mockResolvedValue(null);
    });

    it('should pass validation with valid name update', async () => {
      mockReq.body = {
        name: 'Updated Name',
        email: 'existing@example.com' // Include email to satisfy the at-least-one check
      };
      
      const errors = await runValidation(updateParticipantRules);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass validation with valid email update', async () => {
      mockReq.body = {
        email: 'new.email@example.com'
      };
      
      const errors = await runValidation(updateParticipantRules);
      expect(errors.isEmpty()).toBe(true);
      expect(mockPrisma.participant.findFirst).toHaveBeenCalledWith({
        where: {
          email: 'new.email@example.com',
          NOT: { id: '123e4567-e89b-12d3-a456-426614174000' }
        },
        select: { id: true }
      });
    });

    it('should fail if no fields are provided', async () => {
      mockReq.body = {};
      
      const errors = await runValidation(updateParticipantRules);
      expect(errors.array()[0].msg).toBe('At least one field (name or email) must be provided for update');
    });

    it('should fail if email is already in use by another participant', async () => {
      mockReq.body = {
        email: 'existing@example.com'
      };
      
      // Mock that a participant with this email already exists
      mockPrisma.participant.findFirst.mockResolvedValueOnce({ id: '456' });
      
      const errors = await runValidation(updateParticipantRules);
      expect(errors.array()[0].msg).toBe(VALIDATION_MESSAGES.EMAIL_IN_USE);
      expect(mockPrisma.participant.findFirst).toHaveBeenCalledWith({
        where: {
          email: 'existing@example.com',
          NOT: { id: '123e4567-e89b-12d3-a456-426614174000' }
        },
        select: { id: true }
      });
    });
  });

  describe('listParticipantsRules', () => {
    it('should pass with valid pagination params', async () => {
      mockReq.query = {
        page: '1',
        limit: '10'
      };
      
      const errors = await runValidation(listParticipantsRules);
      expect(errors.isEmpty()).toBe(true);
      expect(mockReq.query.page).toBe(1);
      expect(mockReq.query.limit).toBe(10);
    });

    it('should pass with valid name filter', async () => {
      mockReq.query = {
        name: 'John'
      };
      
      const errors = await runValidation(listParticipantsRules);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should pass with valid email filter', async () => {
      mockReq.query = {
        email: 'john@example.com'
      };
      
      const errors = await runValidation(listParticipantsRules);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail with invalid page number', async () => {
      mockReq.query = {
        page: '0'
      };
      
      const errors = await runValidation(listParticipantsRules);
      expect(errors.array()[0].msg).toBe(VALIDATION_MESSAGES.INVALID_PAGE);
    });

    it('should fail with invalid limit', async () => {
      mockReq.query = {
        limit: '200'
      };
      
      const errors = await runValidation(listParticipantsRules);
      expect(errors.array()[0].msg).toBe(VALIDATION_MESSAGES.INVALID_LIMIT);
    });
  });

  describe('getParticipantRules', () => {
    beforeEach(() => {
      // Reset params before each test
      mockReq.params = {};
    });

    it('should pass with valid UUID', async () => {
      mockReq.params.id = '123e4567-e89b-12d3-a456-426614174000';
      
      const errors = await runValidation(getParticipantRules);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail with invalid UUID', async () => {
      mockReq.params.id = 'invalid-uuid';
      
      const errors = await runValidation(getParticipantRules);
      expect(errors.array()[0].msg).toBe('Invalid ID format. Must be a valid UUID');
    });

    it('should fail when ID is missing', async () => {
      const errors = await runValidation(getParticipantRules);
      expect(errors.array()[0].msg).toBe('ID is required');
    });
  });

  describe('deleteParticipantRules', () => {
    beforeEach(() => {
      // Reset params before each test
      mockReq.params = {};
    });

    it('should pass with valid UUID', async () => {
      mockReq.params.id = '123e4567-e89b-12d3-a456-426614174000';
      
      const errors = await runValidation(deleteParticipantRules);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail with invalid UUID', async () => {
      mockReq.params.id = 'invalid-uuid';
      
      const errors = await runValidation(deleteParticipantRules);
      expect(errors.array()[0].msg).toBe('Invalid ID format. Must be a valid UUID');
    });

    it('should fail when ID is missing', async () => {
      const errors = await runValidation(deleteParticipantRules);
      expect(errors.array()[0].msg).toBe('ID is required');
    });
  });

  describe('checkParticipantExists', () => {
    it('should pass if participant exists', async () => {
      mockReq.params.participantId = '123e4567-e89b-12d3-a456-426614174000';
      mockPrisma.participant.findUnique.mockResolvedValue({ id: '123e4567-e89b-12d3-a456-426614174000' });
      
      const errors = await runValidation(checkParticipantExists);
      expect(errors.isEmpty()).toBe(true);
      expect(mockPrisma.participant.findUnique).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        select: { id: true }
      });
    });

    it('should fail if participant does not exist', async () => {
      mockReq.params.participantId = '123e4567-e89b-12d3-a456-426614174000';
      mockPrisma.participant.findUnique.mockResolvedValue(null);
      
      const errors = await runValidation(checkParticipantExists);
      expect(errors.array()[0].msg).toBe('Participant not found');
      expect(mockPrisma.participant.findUnique).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        select: { id: true }
      });
    });
  });
});
