const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../../src/app');
const prisma = new PrismaClient();

describe('Event Routes', () => {
  let testEvent;
  let server;

  beforeAll(async () => {
    // Start the server
    server = app.listen(0); // Use a random available port
    
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
    // Close the server and clean up
    await server.close();
    await prisma.event.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/events', () => {
    it('should create a new event', async () => {
      const eventData = {
        title: 'New Event',
        description: 'New event description',
        eventDate: '2024-01-01T00:00:00Z',
        capacity: 50,
      };

      const response = await request(server)
        .post('/api/events')
        .send(eventData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(eventData.title);
      expect(response.body.data.description).toBe(eventData.description);
      expect(response.body.data.capacity).toBe(eventData.capacity);
    });

    it('should return 400 for invalid event data', async () => {
      const invalidEventData = {
        title: '', // Invalid: empty title
        description: 'Test',
        eventDate: 'invalid-date',
        capacity: -1, // Invalid: negative capacity
      };

      const response = await request(server)
        .post('/api/events')
        .send(invalidEventData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Validation failed');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });

  describe('GET /api/events', () => {
    it('should return a list of events', async () => {
      const response = await request(server)
        .get('/api/events')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });

    it('should support pagination', async () => {
      const response = await request(server)
        .get('/api/events?page=1&limit=1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.pagination).toHaveProperty('currentPage', 1);
      expect(response.body.pagination).toHaveProperty('itemsPerPage', 1);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return a single event', async () => {
      const response = await request(server)
        .get(`/api/events/${testEvent.id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('id', testEvent.id);
      expect(response.body.data.title).toBe(testEvent.title);
    });

    it('should return 404 for non-existent event', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await request(server)
        .get(`/api/events/${nonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/events/:id', () => {
    it('should update an existing event', async () => {
      const updateData = {
        title: 'Updated Event Title',
        capacity: 200,
      };

      const response = await request(server)
        .put(`/api/events/${testEvent.id}`)
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.capacity).toBe(updateData.capacity);
      expect(response.body.data.description).toBe(testEvent.description); // Should remain unchanged
    });

    it('should return 404 for non-existent event', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await request(server)
        .put(`/api/events/${nonExistentId}`)
        .send({ title: 'Updated Title' })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('DELETE /api/events/:id', () => {
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

      await request(server)
        .delete(`/api/events/${eventToDelete.id}`)
        .expect(204);

      // Verify the event was deleted
      const deletedEvent = await prisma.event.findUnique({
        where: { id: eventToDelete.id },
      });
      expect(deletedEvent).toBeNull();
    });

    it('should return 404 for non-existent event', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await request(server)
        .delete(`/api/events/${nonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('status', 'error');
    });
  });
});
