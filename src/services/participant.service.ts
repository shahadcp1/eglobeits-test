import { PrismaClient, Participant, Prisma } from '@prisma/client';
import { BadRequestError, NotFoundError, ConflictError } from '../utils/errors';

const prisma = new PrismaClient();

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface CreateParticipantInput {
  name: string;
  email: string;
  eventId: string;
}

export interface UpdateParticipantInput {
  name?: string;
  email?: string;
}

export const createParticipant = async (data: CreateParticipantInput): Promise<Participant> => {
  try {
    // Check if event exists and has capacity
    const event = await prisma.event.findUnique({
      where: { id: data.eventId },
      include: { _count: { select: { participants: true } } }
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    if (event._count.participants >= event.capacity) {
      throw new BadRequestError('Event has reached maximum capacity');
    }

    const participant = await prisma.participant.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        eventId: data.eventId,
      },
    });

    return participant;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictError('Email is already registered for this event');
      }
    }
    throw error;
  }
};

export const getParticipants = async (
  eventId: string,
  options: PaginationOptions
): Promise<PaginatedResult<Participant>> => {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  // Verify event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new NotFoundError('Event not found');
  }

  const [participants, total] = await Promise.all([
    prisma.participant.findMany({
      where: { eventId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.participant.count({ where: { eventId } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: participants,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

export const getParticipantById = async (id: string): Promise<Participant | null> => {
  const participant = await prisma.participant.findUnique({
    where: { id },
  });

  if (!participant) {
    throw new NotFoundError('Participant not found');
  }

  return participant;
};

export const updateParticipant = async (
  id: string,
  data: UpdateParticipantInput
): Promise<Participant> => {
  try {
    if (data.email) {
      data.email = data.email.toLowerCase();
    }

    const participant = await prisma.participant.update({
      where: { id },
      data,
    });

    return participant;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictError('Email is already in use');
      }
      if (error.code === 'P2025') {
        throw new NotFoundError('Participant not found');
      }
    }
    throw error;
  }
};

export const deleteParticipant = async (id: string): Promise<void> => {
  try {
    await prisma.participant.delete({
      where: { id },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Participant not found');
      }
    }
    throw error;
  }
};

export const participantExists = async (id: string): Promise<boolean> => {
  const participant = await prisma.participant.findUnique({
    where: { id },
    select: { id: true },
  });
  return !!participant;
};
