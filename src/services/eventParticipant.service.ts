import { PrismaClient, Prisma } from '@prisma/client';
import { BadRequestError, ConflictError, NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

/**
 * Add a participant to an event
 */
async function addParticipantToEvent(eventId: string, participantData: { name: string; email: string }) {
  return prisma.$transaction(async (tx) => {
    // Check if event exists and has capacity
    const event = await tx.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { eventParticipants: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Check if event has capacity
    if (event._count.eventParticipants >= event.capacity) {
      throw new BadRequestError('Event has reached maximum capacity');
    }

    // Check if participant with this email already exists
    let participant = await tx.participant.findUnique({
      where: { email: participantData.email },
    });

    // Create participant if doesn't exist
    if (!participant) {
      participant = await tx.participant.create({
        data: {
          name: participantData.name,
          email: participantData.email.toLowerCase(),
        },
      });
    }

    // Check if participant is already registered for this event
    const existingRegistration = await tx.eventParticipant.findUnique({
      where: {
        eventId_participantId: {
          eventId,
          participantId: participant.id,
        },
      },
    });

    if (existingRegistration) {
      throw new ConflictError('Participant is already registered for this event');
    }

    // Register participant for the event
    const registration = await tx.eventParticipant.create({
      data: {
        eventId,
        participantId: participant.id,
      },
      include: {
        participant: true,
      },
    });

    return registration;
  });
}

/**
 * Remove a participant from an event
 */
async function removeParticipantFromEvent(eventId: string, participantId: string) {
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
    await tx.eventParticipant.delete({
      where: {
        eventId_participantId: {
          eventId,
          participantId,
        },
      },
    });

    return { success: true };
  });
}

/**
 * Get all participants for an event
 */
async function getEventParticipants(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      eventParticipants: {
        include: {
          participant: true,
        },
      },
      _count: {
        select: { eventParticipants: true },
      },
    },
  });

  if (!event) {
    throw new NotFoundError('Event not found');
  }


  const participants = event.eventParticipants.map((ep) => ({
    id: ep.participant.id,
    name: ep.participant.name,
    email: ep.participant.email,
    registeredAt: ep.registeredAt,
  }));

  return {
    event: {
      id: event.id,
      title: event.title,
      currentParticipants: event._count.eventParticipants,
      capacity: event.capacity,
    },
    participants,
  };
}

export {
  addParticipantToEvent,
  removeParticipantFromEvent,
  getEventParticipants,
};
