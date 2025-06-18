import { PrismaClient, Prisma } from '@prisma/client';
import { createParticipant, getParticipants, getParticipantById, updateParticipant, deleteParticipant, participantExists } from '../../services/participant.service';
import { BadRequestError, ConflictError, NotFoundError } from '../../utils/errors';
import { PaginationOptions } from '../../types';

// Mock PrismaClient
const mockPrisma = {
  participant: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
  },
  event: {
    findUnique: jest.fn(),
  },
  $disconnect: jest.fn(),
} as unknown as PrismaClient;

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  Prisma: {
    PrismaClientKnownRequestError: class MockPrismaClientKnownRequestError extends Error {
      code: string;
      meta?: Record<string, unknown>;
      constructor(message: string, options: { code: string; meta?: Record<string, unknown> }) {
        super(message);
        this.code = options.code;
        this.meta = options.meta;
      }
    },
  },
}));

describe('Participant Service', () => {
  const testParticipant = {
    id: 'participant-id-123',
    name: 'Test Participant',
    email: 'test@example.com',
    eventId: 'event-id-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as const;

  const testEvent = {
    id: 'event-id-123',
    title: 'Test Event',
    description: 'Test Description',
    eventDate: new Date('2025-12-31T23:59:59.999Z'),
    capacity: 100,
    _count: { participants: 50 },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    mockPrisma.event.findUnique = jest.fn().mockResolvedValue({
      ...testEvent,
      _count: { participants: 50 },
    });
    
    mockPrisma.participant.create = jest.fn().mockResolvedValue(testParticipant);
    mockPrisma.participant.findMany = jest.fn().mockResolvedValue([testParticipant]);
    mockPrisma.participant.count = jest.fn().mockResolvedValue(1);
    mockPrisma.participant.findUnique = jest.fn().mockResolvedValue(testParticipant);
    mockPrisma.participant.findFirst = jest.fn().mockResolvedValue(null);
    mockPrisma.participant.update = jest.fn().mockResolvedValue({
      ...testParticipant,
      name: 'Updated Participant',
    });
    mockPrisma.participant.delete = jest.fn().mockResolvedValue(testParticipant);
  });


  describe('createParticipant', () => {
    it('should create a new participant', async () => {
      const participantData = {
        name: testParticipant.name,
        email: testParticipant.email,
        eventId: testParticipant.eventId,
      };

      const result = await createParticipant(participantData);
      
      expect(mockPrisma.event.findUnique).toHaveBeenCalledWith({
        where: { id: testParticipant.eventId },
        include: { _count: { select: { participants: true } } },
      });
      
      expect(mockPrisma.participant.create).toHaveBeenCalledWith({
        data: {
          name: participantData.name,
          email: participantData.email.toLowerCase(),
          eventId: participantData.eventId,
        },
      });
      
      expect(result).toEqual(testParticipant);
    });

    it('should throw NotFoundError if event does not exist', async () => {
      mockPrisma.event.findUnique = jest.fn().mockResolvedValueOnce(null);
      
      await expect(createParticipant({
        name: 'Test',
        email: 'test@example.com',
        eventId: 'non-existent-event',
      })).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError if event is at capacity', async () => {
      mockPrisma.event.findUnique = jest.fn().mockResolvedValueOnce({
        ...testEvent,
        capacity: 50,
        _count: { participants: 50 },
      });
      
      await expect(createParticipant({
        name: 'Test',
        email: 'test@example.com',
        eventId: testEvent.id,
      })).rejects.toThrow(BadRequestError);
    });

    it('should throw ConflictError if email is already registered', async () => {
      mockPrisma.participant.findFirst = jest.fn().mockResolvedValueOnce({ id: 'existing-id' });
      
      await expect(createParticipant({
        name: 'Test',
        email: 'existing@example.com',
        eventId: testEvent.id,
      })).rejects.toThrow(ConflictError);
    });
  });

  describe('getParticipants', () => {
    it('should return paginated participants for an event', async () => {
      const pagination: PaginationOptions = { page: 1, limit: 10 };
      
      // Setup mock data
      const mockParticipants = [
        { ...testParticipant, id: '1' },
        { ...testParticipant, id: '2', name: 'Another Participant' },
      ];
      
      mockPrisma.participant.findMany = jest.fn().mockResolvedValue(mockParticipants);
      mockPrisma.participant.count = jest.fn().mockResolvedValue(15);
      
      const result = await getParticipants(testEvent.id, pagination);
      
      expect(mockPrisma.event.findUnique).toHaveBeenCalledWith({
        where: { id: testEvent.id },
      });
      
      expect(mockPrisma.participant.findMany).toHaveBeenCalledWith({
        where: { eventId: testEvent.id },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      
      expect(mockPrisma.participant.count).toHaveBeenCalledWith({
        where: { eventId: testEvent.id },
      });
      
      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        total: 15,
        totalPages: 2,
        currentPage: 1,
        hasNextPage: true,
        hasPreviousPage: false,
      });
    });

    it('should throw NotFoundError if event does not exist', async () => {
      mockPrisma.event.findUnique = jest.fn().mockResolvedValueOnce(null);
      
      await expect(getParticipants('non-existent-event', { page: 1, limit: 10 }))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('getParticipantById', () => {
    it('should return a participant by ID', async () => {
      // Setup mock to return a participant
      mockPrisma.participant.findUnique = jest.fn().mockResolvedValue(testParticipant);
      
      const result = await getParticipantById(testParticipant.id);
      
      expect(mockPrisma.participant.findUnique).toHaveBeenCalledWith({
        where: { id: testParticipant.id },
      });
      
      expect(result).toBeDefined();
      expect(result?.id).toBe(testParticipant.id);
    });

    it('should throw NotFoundError if participant does not exist', async () => {
      mockPrisma.participant.findUnique = jest.fn().mockResolvedValueOnce(null);
      
      await expect(getParticipantById('non-existent-id'))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if participant is not found', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: 'test',
      });
      
      mockPrisma.participant.findUnique = jest.fn().mockRejectedValueOnce(error);
      
      await expect(getParticipantById('non-existent-id'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('updateParticipant', () => {
    it('should update a participant', async () => {
      const updates = { name: 'Updated Participant' };
      
      // Setup mock for successful update
      const updatedParticipant = { ...testParticipant, ...updates };
      mockPrisma.participant.update = jest.fn().mockResolvedValue(updatedParticipant);
      
      const result = await updateParticipant(testParticipant.id, updates);
      
      expect(mockPrisma.participant.update).toHaveBeenCalledWith({
        where: { id: testParticipant.id },
        data: updates,
      });
      
      expect(result.name).toBe('Updated Participant');
    });

    it('should throw NotFoundError if participant does not exist', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: 'test',
      });
      
      mockPrisma.participant.update = jest.fn().mockRejectedValueOnce(error);
      
      await expect(updateParticipant('non-existent-id', { name: 'Updated' }))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError if email is already in use', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        meta: { target: ['email'] },
        clientVersion: 'test',
      });
      
      mockPrisma.participant.update = jest.fn().mockRejectedValueOnce(error);
      
      await expect(
        updateParticipant(testParticipant.id, { email: 'existing@example.com' })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('deleteParticipant', () => {
    it('should delete a participant', async () => {
      await deleteParticipant(testParticipant.id);
      
      expect(mockPrisma.participant.delete).toHaveBeenCalledWith({
        where: { id: testParticipant.id },
      });
    });

    it('should throw NotFoundError if participant does not exist', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: 'test',
      });
      
      mockPrisma.participant.delete = jest.fn().mockRejectedValueOnce(error);
      
      await expect(deleteParticipant('non-existent-id'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('participantExists', () => {
    it('should return true if participant exists', async () => {
      mockPrisma.participant.findUnique = jest.fn().mockResolvedValueOnce({ id: testParticipant.id });
      
      const exists = await participantExists(testParticipant.id);
      
      expect(mockPrisma.participant.findUnique).toHaveBeenCalledWith({
        where: { id: testParticipant.id },
        select: { id: true },
      });
      
      expect(exists).toBe(true);
    });

    it('should return false if participant does not exist', async () => {
      mockPrisma.participant.findUnique = jest.fn().mockResolvedValueOnce(null);
      
      const exists = await participantExists('non-existent-id');
      expect(exists).toBe(false);
    });
  });
});
