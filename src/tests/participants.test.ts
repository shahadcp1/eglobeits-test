import request from 'supertest';
import { PrismaClient, Participant, Event } from '@prisma/client';
import app from '../app';
import { Server } from 'http';
import * as participantService from '../services/participant.service';

const prisma = new PrismaClient();
let server: Server;

const mockParticipant: Participant = {
  id: 'participant-id-123',
  name: 'Test Participant',
  email: 'test@example.com',
  eventId: 'event-id-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockEvent: Event = {
  id: 'event-id-123',
  title: 'Test Event',
  description: 'Test Description',
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

describe('Participants API', () => {
  describe('POST /api/events/:eventId/participants', () => {
    it('should register a new participant for an event', async () => {
      jest.spyOn(participantService, 'createParticipant').mockResolvedValueOnce(mockParticipant);

      const response = await request(server)
        .post('/api/events/event-id-123/participants')
        .send({
          name: 'Test Participant',
          email: 'test@example.com',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({
        id: mockParticipant.id,
        name: mockParticipant.name,
        email: mockParticipant.email,
        eventId: mockParticipant.eventId,
      });
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(server)
        .post('/api/events/event-id-123/participants')
        .send({
          name: '', // Invalid: empty name
          email: 'invalid-email', // Invalid email format
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Validation Error');
      expect(response.body.errors).toHaveProperty('name');
      expect(response.body.errors).toHaveProperty('email');
    });
  });

  describe('GET /api/events/:eventId/participants', () => {
    it('should return a list of participants for an event', async () => {
      const mockResult = {
        data: [mockParticipant, { ...mockParticipant, id: 'participant-id-456' }],
        pagination: {
          total: 2,
          totalPages: 1,
          currentPage: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      jest.spyOn(participantService, 'getParticipants').mockResolvedValueOnce(mockResult);

      const response = await request(server)
        .get('/api/events/event-id-123/participants?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toEqual(mockResult.pagination);
    });
  });

  describe('GET /api/participants/:id', () => {
    it('should return a participant by ID', async () => {
      jest.spyOn(participantService, 'getParticipantById').mockResolvedValueOnce(mockParticipant);

      const response = await request(server)
        .get(`/api/participants/${mockParticipant.id}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({
        id: mockParticipant.id,
        name: mockParticipant.name,
        email: mockParticipant.email,
      });
    });

    it('should return 404 for non-existent participant', async () => {
      jest.spyOn(participantService, 'getParticipantById').mockImplementationOnce(() => {
        throw new Error('Participant not found');
      });

      const response = await request(server)
        .get('/api/participants/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });

  describe('PUT /api/participants/:id', () => {
    it('should update a participant', async () => {
      const updatedParticipant = {
        ...mockParticipant,
        name: 'Updated Participant',
      };

      jest.spyOn(participantService, 'updateParticipant').mockResolvedValueOnce(updatedParticipant);

      const response = await request(server)
        .put(`/api/participants/${mockParticipant.id}`)
        .send({ name: 'Updated Participant' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe('Updated Participant');
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(server)
        .put(`/api/participants/${mockParticipant.id}`)
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /api/participants/:id', () => {
    it('should delete a participant', async () => {
      jest.spyOn(participantService, 'deleteParticipant').mockResolvedValueOnce();

      const response = await request(server)
        .delete(`/api/participants/${mockParticipant.id}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent participant', async () => {
      jest.spyOn(participantService, 'deleteParticipant').mockImplementationOnce(() => {
        throw new Error('Participant not found');
      });

      const response = await request(server)
        .delete('/api/participants/non-existent-id');

      expect(response.status).toBe(404);
    });
  });
});
