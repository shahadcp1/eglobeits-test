const prisma = require('../config/prisma');

/**
 * Register a participant to an event
 * @param {string} eventId - Event ID
 * @param {string} participantId - Participant ID
 * @returns {Promise<Object>} Registration record
 */
const registerParticipant = async (eventId, participantId) => {
  return await prisma.$transaction(async (tx) => {
    // Check if event exists and has capacity
    const event = await tx.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { participants: true }
        }
      }
    });

    if (!event) {
      const error = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if participant exists
    const participant = await tx.participant.findUnique({
      where: { id: participantId }
    });

    if (!participant) {
      const error = new Error('Participant not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if event has capacity
    if (event._count.participants >= event.capacity) {
      const error = new Error('Event has reached maximum capacity');
      error.statusCode = 400;
      throw error;
    }

    // Check if already registered
    const existingRegistration = await tx.eventParticipant.findUnique({
      where: {
        eventId_participantId: {
          eventId,
          participantId
        }
      }
    });

    if (existingRegistration) {
      const error = new Error('Participant already registered for this event');
      error.statusCode = 400;
      throw error;
    }

    // Register participant
    return await tx.eventParticipant.create({
      data: {
        eventId,
        participantId
      },
      include: {
        event: true,
        participant: true
      }
    });
  });
};

/**
 * Remove a participant from an event
 * @param {string} eventId - Event ID
 * @param {string} participantId - Participant ID
 * @returns {Promise<void>}
 */
const removeParticipant = async (eventId, participantId) => {
  // First check if the registration exists
  const registration = await prisma.eventParticipant.findUnique({
    where: {
      eventId_participantId: {
        eventId,
        participantId
      }
    }
  });

  if (!registration) {
    const error = new Error('Registration not found');
    error.statusCode = 404;
    throw error;
  }

  // If registration exists, delete it
  await prisma.eventParticipant.delete({
    where: {
      eventId_participantId: {
        eventId,
        participantId
      }
    }
  });
};

/**
 * Get all participants for an event
 * @param {string} eventId - Event ID
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @returns {Promise<Object>} Paginated participants
 */
const getEventParticipants = async (eventId, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;
  
  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }

  const [total, participants] = await Promise.all([
    prisma.eventParticipant.count({
      where: { eventId }
    }),
    prisma.eventParticipant.findMany({
      where: { eventId },
      include: {
        participant: true
      },
      skip,
      take: parseInt(limit),
      orderBy: { registeredAt: 'desc' }
    })
  ]);

  return {
    data: participants.map(ep => ({
      ...ep.participant,
      registeredAt: ep.registeredAt
    })),
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      remainingCapacity: Math.max(0, event.capacity - total)
    }
  };
};

/**
 * Get all events for a participant
 * @param {string} participantId - Participant ID
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @returns {Promise<Object>} Paginated events
 */
const getParticipantEvents = async (participantId, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;
  
  // Check if participant exists
  const participant = await prisma.participant.findUnique({
    where: { id: participantId }
  });

  if (!participant) {
    const error = new Error('Participant not found');
    error.statusCode = 404;
    throw error;
  }

  const [total, events] = await Promise.all([
    prisma.eventParticipant.count({
      where: { participantId }
    }),
    prisma.eventParticipant.findMany({
      where: { participantId },
      include: {
        event: true
      },
      skip,
      take: parseInt(limit),
      orderBy: { registeredAt: 'desc' }
    })
  ]);

  return {
    data: events.map(ep => ({
      ...ep.event,
      registeredAt: ep.registeredAt
    })),
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  registerParticipant,
  removeParticipant,
  getEventParticipants,
  getParticipantEvents
};
