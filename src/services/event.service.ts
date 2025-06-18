import { PrismaClient, Event } from '@prisma/client';

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

export const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
  return await prisma.event.create({
    data: {
      ...eventData,
      eventDate: new Date(eventData.eventDate),
    },
  });
};

export const getEvents = async (options: PaginationOptions): Promise<PaginatedResult<Event>> => {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.event.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: events,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

export const getEventById = async (id: string): Promise<Event | null> => {
  return await prisma.event.findUnique({
    where: { id },
  });
};

export const updateEvent = async (id: string, eventData: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Event> => {
  if (eventData.eventDate) {
    eventData.eventDate = new Date(eventData.eventDate);
  }
  
  return await prisma.event.update({
    where: { id },
    data: eventData,
  });
};

export const deleteEvent = async (id: string): Promise<void> => {
  await prisma.event.delete({
    where: { id },
  });
};

export const eventExists = async (id: string): Promise<boolean> => {
  const event = await prisma.event.findUnique({
    where: { id },
    select: { id: true },
  });
  return !!event;
};
