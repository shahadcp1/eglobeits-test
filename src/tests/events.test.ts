import request from 'supertest';
import { PrismaClient, Event } from '@prisma/client';
import app from '../app';
import { Server } from 'http';
import * as eventService from '../services/event.service';

const prisma = new PrismaClient();
let server: Server;

const testEvent = {
  title: 'Test Event',
  description: 'This is a test event',
  eventDate: '2025-12-31T23:59:59.999Z',
  capacity: 100,
};

const mockEvent: Event = {
  id: 'test-id-123',
  title: 'Test Event',
  description: 'This is a test event',
  eventDate: new Date('2025-12-31T23:59:59.999Z'),
  capacity: 100,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeAll(async () => {
  server = app.listen(3001);
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
  server.close();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Events API', () => {
  describe('POST /api/events', () => {
    it('should create a new event', async () => {
      jest.spyOn(eventService, 'createEvent').mockResolvedValueOnce({
        ...mockEvent,
        eventDate: new Date(testEvent.eventDate),
      });

      const response = await request(server)
        .post('/api/events')
        .send(testEvent);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(testEvent.title);
      expect(response.body.description).toBe(testEvent.description);
      expect(new Date(response.body.eventDate).toISOString()).toBe(testEvent.eventDate);
      expect(response.body.capacity).toBe(testEvent.capacity);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(server)
        .post('/api/events')
        .send({ title: 'Incomplete Event' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/events', () => {
    it('should return a list of events with pagination', async () => {
      const mockEvents = [
        { ...mockEvent, title: 'Event 1' },
        { ...mockEvent, title: 'Event 2' },
      ];
      
      jest.spyOn(eventService, 'getEvents').mockResolvedValueOnce({
        data: mockEvents,
        pagination: {
          total: 3,
          totalPages: 2,
          currentPage: 1,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      });

      const response = await request(server)
        .get('/api/events?page=1&limit=2');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toEqual({
        total: 3,
        totalPages: 2,
        currentPage: 1,
        hasNextPage: true,
        hasPreviousPage: false,
      });
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return an event by id', async () => {
      jest.spyOn(eventService, 'getEventById').mockResolvedValueOnce(mockEvent);

      const response = await request(server)
        .get(`/api/events/${mockEvent.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(mockEvent.id);
      expect(response.body.title).toBe(mockEvent.title);
    });

    it('should return 404 if event not found', async () => {
      jest.spyOn(eventService, 'getEventById').mockResolvedValueOnce(null);

      const response = await request(server)
        .get(`/api/events/non-existent-id`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/events/:id', () => {
    it('should update an event', async () => {
      const updates = {
        title: 'Updated Event',
        capacity: 200,
      };

      jest.spyOn(eventService, 'eventExists').mockResolvedValueOnce(true);
      jest.spyOn(eventService, 'updateEvent').mockResolvedValueOnce({
        ...mockEvent,
        ...updates,
      });

      const response = await request(server)
        .put(`/api/events/${mockEvent.id}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updates.title);
      expect(response.body.capacity).toBe(updates.capacity);
    });

    it('should return 404 if event not found', async () => {
      jest.spyOn(eventService, 'eventExists').mockResolvedValueOnce(false);

      const response = await request(server)
        .put(`/api/events/non-existent-id`)
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should delete an event', async () => {
      jest.spyOn(eventService, 'eventExists').mockResolvedValueOnce(true);
      jest.spyOn(eventService, 'deleteEvent').mockResolvedValueOnce();

      const response = await request(server)
        .delete(`/api/events/${mockEvent.id}`);

      expect(response.status).toBe(200);
    });

    it('should return 404 if event not found', async () => {
      jest.spyOn(eventService, 'eventExists').mockResolvedValueOnce(false);

      const response = await request(server)
        .delete('/api/events/non-existent-id');

      expect(response.status).toBe(404);
    });
  });
});
