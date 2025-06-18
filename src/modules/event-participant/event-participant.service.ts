import { PrismaClient, Prisma } from '@prisma/client';
import { 
  AddParticipantToEventDto, 
  RemoveParticipantFromEventDto 
} from './dto/event-participant.dto';
import { 
  BadRequestError, 
  ConflictError, 
  NotFoundError 
} from '../../utils/errors';

const prisma = new PrismaClient();

export class EventParticipantService {
  async addParticipantToEvent(
    eventId: string,
    participantId: string
  ) {
    return prisma.$transaction(async (tx) => {
      // Check if event exists and has capacity
      const event = await tx.event.findUnique({
        where: { id: eventId },
        include: {
          _count: {
            select: { participants: true },
          },
        },
      });

      if (!event) {
        throw new NotFoundError('Event not found');
      }

      if (event._count.participants >= event.capacity) {
        throw new BadRequestError('Event has reached maximum capacity');
      }

      // Check if participant exists
      const participant = await tx.participant.findUnique({
        where: { id: participantId },
      });

      if (!participant) {
        throw new NotFoundError('Participant not found');
      }

      // Check if participant is already registered
      const existingRegistration = await tx.eventParticipant.findUnique({
        where: {
          eventId_participantId: {
            eventId,
            participantId,
          },
        },
      });

      if (existingRegistration) {
        throw new ConflictError('Participant is already registered for this event');
      }

      // Register participant
      return tx.eventParticipant.create({
        data: {
          eventId,
          participantId,
        },
        include: {
          participant: true,
        },
      });
    });
  }


  async removeParticipantFromEvent(
    eventId: string,
    participantId: string
  ) {
    return prisma.$transaction(async (tx) => {
      // Check if event exists
      const event = await tx.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new NotFoundError('Event not found');
      }

      // Check if participant exists
      const participant = await tx.participant.findUnique({
        where: { id: participantId },
      });

      if (!participant) {
        throw new NotFoundError('Participant not found');
      }

      // Check if participant is registered for the event
      const registration = await tx.eventParticipant.findUnique({
        where: {
          eventId_participantId: {
            eventId,
            participantId,
          },
        },
      });

      if (!registration) {
        throw new NotFoundError('Participant is not registered for this event');
      }

      // Remove participant from event
      return tx.eventParticipant.delete({
        where: {
          id: registration.id,
        },
        include: {
          participant: true,
        },
      });
    });
  }

  async getEventParticipants(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participants: {
          include: {
            participant: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    return event.participants.map((ep) => ({
      id: ep.id,
      participant: {
        id: ep.participant.id,
        name: ep.participant.name,
        email: ep.participant.email,
      },
      registeredAt: ep.registeredAt,
    }));
  }
}

export const eventParticipantService = new EventParticipantService();
