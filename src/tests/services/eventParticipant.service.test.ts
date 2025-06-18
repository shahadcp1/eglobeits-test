// Mock Prisma client first
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    $transaction: jest.fn(),
    event: {
      findUnique: jest.fn(),
    },
    participant: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    eventParticipant: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
    Prisma: {
      PrismaClientKnownRequestError: class MockPrismaClientKnownRequestError extends Error {
        code: string;
        meta?: Record<string, unknown>;
        clientVersion: string;
        
        constructor(message: string, options: { code: string; meta?: Record<string, unknown>; clientVersion: string }) {
          super(message);
          this.code = options.code;
          this.meta = options.meta;
          this.clientVersion = options.clientVersion;
        }
      },
    },
    mockPrisma, // Export mockPrisma for test usage
  };
});

// Import after setting up the mock
import type { Prisma } from '@prisma/client';
import { BadRequestError, ConflictError, NotFoundError } from '../../../src/utils/errors';
import * as eventParticipantService from '../../../src/services/eventParticipant.service';

// Get the mocked Prisma client
const { mockPrisma } = require('@prisma/client');
const prisma = mockPrisma;

describe('Event Participant Service', () => {
  const mockEvent = {
    id: 'event-123',
    title: 'Test Event',
    description: 'Test Description',
    eventDate: new Date(),
    capacity: 10,
    _count: {
      eventParticipants: 5,
    },
  };

  const mockParticipant = {
    id: 'participant-123',
    name: 'Test User',
    email: 'test@example.com',
  };

  const mockEventParticipant = {
    id: 'registration-123',
    eventId: 'event-123',
    participantId: 'participant-123',
    registeredAt: new Date(),
    participant: mockParticipant,
  };

  // Add type for the transaction callback
  type TransactionCallback = (prisma: any) => Promise<any>;

  // Helper to create a mock Prisma error
  const createPrismaError = (code: string, message: string, meta?: any) => {
    return new (class extends Error {
      code = code;
      meta = meta;
      clientVersion = 'test';
      constructor() {
        super(message);
      }
    })();
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementation for transaction
    prisma.$transaction.mockImplementation(async (callback: TransactionCallback) => {
      return await callback(prisma);
    });
  });

  describe('addParticipantToEvent', () => {
    it('should add a participant to an event', async () => {
      // Transaction mock is already set up in beforeEach
      const mockTransaction = prisma.$transaction as jest.MockedFunction<typeof prisma.$transaction>;

      // Mock event check
      prisma.event.findUnique.mockResolvedValueOnce({
        ...mockEvent,
        _count: { eventParticipants: 5 },
      });

      // Mock participant check (not found)
      prisma.participant.findUnique.mockResolvedValueOnce(null);

      // Mock participant creation
      prisma.participant.create.mockResolvedValueOnce(mockParticipant);

      // Mock registration check (not found)
      prisma.eventParticipant.findUnique.mockResolvedValueOnce(null);

      // Mock registration creation
      prisma.eventParticipant.create.mockResolvedValueOnce(mockEventParticipant);

      const result = await eventParticipantService.addParticipantToEvent(
        'event-123',
        { name: 'Test User', email: 'test@example.com' }
      );

      expect(result).toEqual(mockEventParticipant);
      expect(prisma.eventParticipant.create).toHaveBeenCalledWith({
        data: {
          eventId: 'event-123',
          participantId: 'participant-123',
        },
        include: {
          participant: true,
        },
      });
    });

    it('should throw error if event is at capacity', async () => {
      // Transaction mock is already set up in beforeEach
      const mockTransaction = prisma.$transaction as jest.MockedFunction<typeof prisma.$transaction>;

      // Mock event at capacity
      prisma.event.findUnique.mockResolvedValueOnce({
        ...mockEvent,
        _count: { eventParticipants: 10 },
      });

      await expect(
        eventParticipantService.addParticipantToEvent('event-123', {
          name: 'Test User',
          email: 'test@example.com',
        })
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw error if participant already registered', async () => {
      // Transaction mock is already set up in beforeEach
      const mockTransaction = prisma.$transaction as jest.MockedFunction<typeof prisma.$transaction>;

      // Mock event check
      prisma.event.findUnique.mockResolvedValueOnce({
        ...mockEvent,
        _count: { eventParticipants: 5 },
      });

      // Mock participant exists
      prisma.participant.findUnique.mockResolvedValueOnce(mockParticipant);

      // Mock registration exists
      prisma.eventParticipant.findUnique.mockResolvedValueOnce(mockEventParticipant);


      await expect(
        eventParticipantService.addParticipantToEvent('event-123', {
          name: 'Test User',
          email: 'test@example.com',
        })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('removeParticipantFromEvent', () => {
    it('should remove a participant from an event', async () => {
      // Transaction mock is already set up in beforeEach
      const mockTransaction = prisma.$transaction as jest.MockedFunction<typeof prisma.$transaction>;

      // Mock event check
      prisma.event.findUnique.mockResolvedValueOnce(mockEvent);

      // Mock participant check
      prisma.participant.findUnique.mockResolvedValueOnce(mockParticipant);

      // Mock registration check
      prisma.eventParticipant.findUnique.mockResolvedValueOnce(mockEventParticipant);

      // Mock deletion
      prisma.eventParticipant.delete.mockResolvedValueOnce(mockEventParticipant);

      const result = await eventParticipantService.removeParticipantFromEvent(
        'event-123',
        'participant-123'
      );

      expect(result).toEqual({ success: true });
      expect(prisma.eventParticipant.delete).toHaveBeenCalledWith({
        where: {
          eventId_participantId: {
            eventId: 'event-123',
            participantId: 'participant-123',
          },
        },
      });
    });

    it('should throw error if participant not registered for event', async () => {
      // Transaction mock is already set up in beforeEach
      const mockTransaction = prisma.$transaction as jest.MockedFunction<typeof prisma.$transaction>;

      // Mock event check
      prisma.event.findUnique.mockResolvedValueOnce(mockEvent);

      // Mock participant check
      prisma.participant.findUnique.mockResolvedValueOnce(mockParticipant);
      // Mock registration not found
      prisma.eventParticipant.findUnique.mockResolvedValueOnce(null);

      await expect(
        eventParticipantService.removeParticipantFromEvent('event-123', 'participant-123')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getEventParticipants', () => {
    it('should get all participants for an event', async () => {
      // Mock event with participants
      const mockEventWithParticipants = {
        ...mockEvent,
        eventParticipants: [
          {
            ...mockEventParticipant,
            participant: mockParticipant,
          },
        ],
        _count: { eventParticipants: 1 },
      };

      prisma.event.findUnique.mockResolvedValueOnce(mockEventWithParticipants);

      const result = await eventParticipantService.getEventParticipants('event-123');

      expect(result).toEqual({
        event: {
          id: 'event-123',
          title: 'Test Event',
          currentParticipants: 1,
          capacity: 10,
        },
        participants: [
          {
            id: 'participant-123',
            name: 'Test User',
            email: 'test@example.com',
            registeredAt: expect.any(Date),
          },
        ],
      });
    });

    it('should throw error if event not found', async () => {
      prisma.event.findUnique.mockResolvedValueOnce(null);

      await expect(
        eventParticipantService.getEventParticipants('non-existent-event')
      ).rejects.toThrow(NotFoundError);
    });
  });
});
