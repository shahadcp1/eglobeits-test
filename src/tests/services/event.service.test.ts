import { PrismaClient, Event } from '@prisma/client';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  eventExists,
  PaginationOptions,
} from '../../services/event.service';

// Mock the Prisma client
jest.mock('@prisma/client', () => {
  const mockEvent = {
    id: 'test-id-123',
    title: 'Test Event',
    description: 'Test Description',
    eventDate: new Date('2025-12-31T23:59:59.999Z'),
    capacity: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    event: {
      create: jest.fn().mockResolvedValue(mockEvent),
      findMany: jest.fn().mockResolvedValue([mockEvent, mockEvent]),
      count: jest.fn().mockResolvedValue(2),
      findUnique: jest.fn().mockResolvedValue(mockEvent),
      update: jest.fn().mockResolvedValue({
        ...mockEvent,
        title: 'Updated Event',
      }),
      delete: jest.fn().mockResolvedValue(mockEvent),
    },
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

describe('Event Service', () => {
  let prisma: PrismaClient;
  const testEvent = {
    title: 'Test Event',
    description: 'Test Description',
    eventDate: new Date('2025-12-31T23:59:59.999Z'),
    capacity: 100,
  };

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const event = await createEvent(testEvent);
      expect(prisma.event.create).toHaveBeenCalledWith({
        data: {
          ...testEvent,
          eventDate: testEvent.eventDate,
        },
      });
      expect(event).toHaveProperty('id');
      expect(event.title).toBe(testEvent.title);
    });
  });

  describe('getEvents', () => {
    it('should return paginated events', async () => {
      const pagination: PaginationOptions = { page: 1, limit: 10 };
      const result = await getEvents(pagination);

      expect(prisma.event.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(prisma.event.count).toHaveBeenCalled();
      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        total: 2,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });
  });

  describe('getEventById', () => {
    it('should return an event by id', async () => {
      const eventId = 'test-id-123';
      const event = await getEventById(eventId);

      expect(prisma.event.findUnique).toHaveBeenCalledWith({
        where: { id: eventId },
      });
      expect(event).toBeDefined();
      expect(event?.id).toBe(eventId);
    });
  });

  describe('updateEvent', () => {
    it('should update an event', async () => {
      const eventId = 'test-id-123';
      const updates = { title: 'Updated Event' };
      const updatedEvent = await updateEvent(eventId, updates);

      expect(prisma.event.update).toHaveBeenCalledWith({
        where: { id: eventId },
        data: updates,
      });
      expect(updatedEvent.title).toBe('Updated Event');
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      const eventId = 'test-id-123';
      await deleteEvent(eventId);

      expect(prisma.event.delete).toHaveBeenCalledWith({
        where: { id: eventId },
      });
    });
  });

  describe('eventExists', () => {
    it('should return true if event exists', async () => {
      const eventId = 'test-id-123';
      const exists = await eventExists(eventId);

      expect(prisma.event.findUnique).toHaveBeenCalledWith({
        where: { id: eventId },
        select: { id: true },
      });
      expect(exists).toBe(true);
    });
  });
});
