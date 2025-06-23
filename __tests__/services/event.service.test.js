const { PrismaClient } = require('@prisma/client');
const eventService = require('../../src/services/event.service');

const prisma = new PrismaClient();

describe('Event Service', () => {
  let testEvent;

  beforeAll(async () => {
    // Create a test event
    testEvent = await prisma.event.create({
      data: {
        title: 'Test Event',
        description: 'This is a test event',
        eventDate: new Date('2024-12-31T23:59:59Z'),
        capacity: 100,
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.event.deleteMany({});
    await prisma.$disconnect();
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const eventData = {
        title: 'New Event',
        description: 'New event description',
        eventDate: '2024-01-01T00:00:00Z',
        capacity: 50,
      };

      const event = await eventService.createEvent(eventData);

      expect(event).toHaveProperty('id');
      expect(event.title).toBe(eventData.title);
      expect(event.description).toBe(eventData.description);
      expect(new Date(event.eventDate).toISOString()).toBe(eventData.eventDate);
      expect(event.capacity).toBe(eventData.capacity);
    });
  });

  describe('getEvents', () => {
    it('should return paginated events', async () => {
      const result = await eventService.getEvents({ page: 1, limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination).toHaveProperty('total');
      expect(result.pagination).toHaveProperty('totalPages');
      expect(result.pagination).toHaveProperty('currentPage', 1);
      expect(result.pagination).toHaveProperty('itemsPerPage', 10);
    });
  });

  describe('getEventById', () => {
    it('should return an event by id', async () => {
      const event = await eventService.getEventById(testEvent.id);

      expect(event).toBeDefined();
      expect(event.id).toBe(testEvent.id);
      expect(event.title).toBe(testEvent.title);
    });

    it('should throw an error if event not found', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await expect(eventService.getEventById(nonExistentId)).rejects.toThrow('Event not found');
    });
  });

  describe('updateEvent', () => {
    it('should update an existing event', async () => {
      const updateData = {
        title: 'Updated Event Title',
        capacity: 200,
      };

      const updatedEvent = await eventService.updateEvent(testEvent.id, updateData);

      expect(updatedEvent).toBeDefined();
      expect(updatedEvent.id).toBe(testEvent.id);
      expect(updatedEvent.title).toBe(updateData.title);
      expect(updatedEvent.capacity).toBe(updateData.capacity);
      expect(updatedEvent.description).toBe(testEvent.description); // Should remain unchanged
    });
  });

  describe('deleteEvent', () => {
    it('should delete an existing event', async () => {
      // Create a new event to delete
      const eventToDelete = await prisma.event.create({
        data: {
          title: 'Event to Delete',
          description: 'This event will be deleted',
          eventDate: new Date('2024-12-31T23:59:59Z'),
          capacity: 10,
        },
      });

      await eventService.deleteEvent(eventToDelete.id);

      // Verify the event was deleted
      await expect(eventService.getEventById(eventToDelete.id)).rejects.toThrow('Event not found');
    });
  });
});
