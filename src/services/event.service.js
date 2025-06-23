const prisma = require('../config/prisma');
const { Prisma } = require('@prisma/client');

/**
 * Create a new event
 * @param {Object} eventData - Event data
 * @returns {Promise<Object>} Created event
 */
const createEvent = async (eventData) => {
  try {
    const event = await prisma.event.create({
      data: {
        title: eventData.title,
        description: eventData.description,
        eventDate: new Date(eventData.eventDate),
        capacity: eventData.capacity
      }
    });
    return event;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw error;
    }
    throw new Error('Failed to create event');
  }
};

/**
 * Get all events with pagination
 * @param {Object} options - Query options
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=10] - Number of items per page
 * @param {string} [options.sortBy='createdAt'] - Field to sort by
 * @param {string} [options.sortOrder='desc'] - Sort order (asc/desc)
 * @returns {Promise<Object>} Paginated events
 */
const getEvents = async ({
  page = 1,
  limit = 10,
  sortBy = 'createdAt',
  sortOrder = 'desc'
} = {}) => {
  try {
    const skip = (page - 1) * limit;
    
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder
        },
        select: {
          id: true,
          title: true,
          description: true,
          eventDate: true,
          capacity: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.event.count()
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: events,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage,
        hasPreviousPage
      }
    };
  } catch (error) {
    throw new Error('Failed to fetch events');
  }
};

/**
 * Get event by ID
 * @param {string} id - Event ID
 * @returns {Promise<Object>} Event details
 */
const getEventById = async (id) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        eventDate: true,
        capacity: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!event) {
      const error = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }

    return event;
  } catch (error) {
    if (error.statusCode === 404) throw error;
    throw new Error('Failed to fetch event');
  }
};

/**
 * Update an event
 * @param {string} id - Event ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated event
 */
const updateEvent = async (id, updateData) => {
  try {
    // Check if event exists
    await getEventById(id);

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...(updateData.title && { title: updateData.title }),
        ...(updateData.description && { description: updateData.description }),
        ...(updateData.eventDate && { eventDate: new Date(updateData.eventDate) }),
        ...(updateData.capacity && { capacity: updateData.capacity })
      },
      select: {
        id: true,
        title: true,
        description: true,
        eventDate: true,
        capacity: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return updatedEvent;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw error;
    }
    throw error;
  }
};

/**
 * Delete an event
 * @param {string} id - Event ID
 * @returns {Promise<Object>} Deleted event
 */
const deleteEvent = async (id) => {
  try {
    // Check if event exists
    await getEventById(id);

    const deletedEvent = await prisma.event.delete({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        eventDate: true,
        capacity: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return deletedEvent;
  } catch (error) {
    if (error.statusCode === 404) throw error;
    throw new Error('Failed to delete event');
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent
};
