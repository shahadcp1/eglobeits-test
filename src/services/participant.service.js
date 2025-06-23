const prisma = require('../config/prisma');

/**
 * Create a new participant
 * @param {Object} participantData - Participant data
 * @param {string} participantData.name - Participant's name (2-100 chars)
 * @param {string} participantData.email - Participant's email (must be unique)
 * @returns {Promise<Object>} Created participant
 * @throws {ApiError} If validation fails or email already exists
 */
const createParticipant = async (participantData) => {
  try {
    const participant = await prisma.participant.create({
      data: {
        name: participantData.name,
        email: participantData.email.toLowerCase()
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    return participant;
  } catch (error) {
    if (error.code === 'P2002') {
      const conflictError = new Error('Email already in use');
      conflictError.statusCode = 409;
      throw conflictError;
    }
    
    console.error('Error creating participant:', error);
    const apiError = new Error('Failed to create participant');
    apiError.statusCode = 500;
    throw apiError;
  }
};

/**
 * Get all participants with pagination and filtering
 * @param {Object} options - Query options
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=10] - Items per page (max 100)
 * @param {string} [options.name] - Filter by name (case-insensitive contains)
 * @param {string} [options.email] - Filter by exact email match
 * @returns {Promise<Object>} Paginated participants
 * @throws {ApiError} If there's an error fetching participants
 */
const getParticipants = async ({ 
  page = 1, 
  limit = 10, 
  name, 
  email 
} = {}) => {
  try {
    // Validate limit
    const take = Math.min(parseInt(limit, 10), 100) || 10;
    const skip = (Math.max(1, parseInt(page, 10) || 1) - 1) * take;

    // Build where clause
    const where = {};
    
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive'
      };
    }
    
    if (email) {
      where.email = email;
    }

    const [total, participants] = await Promise.all([
      prisma.participant.count({ where }),
      prisma.participant.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true
        }
      })
    ]);

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const totalPages = Math.ceil(total / take);

    return {
      data: participants,
      pagination: {
        total,
        page: currentPage,
        limit: take,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1
      }
    };
  } catch (error) {
    console.error('Error fetching participants:', error);
    const apiError = new Error('Failed to fetch participants');
    apiError.statusCode = 500;
    throw apiError;
  }
};

/**
 * Get a single participant by ID
 * @param {string} id - Participant ID (UUID)
 * @returns {Promise<Object>} Participant
 * @throws {ApiError} If participant is not found or ID is invalid
 */
const getParticipantById = async (id) => {
  try {
    const participant = await prisma.participant.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!participant) {
      const notFoundError = new Error('Participant not found');
      notFoundError.statusCode = 404;
      throw notFoundError;
    }

    return participant;
  } catch (error) {
    if (error.code === 'P2023' || error.code === 'P2025') {
      // P2023: Invalid ID format, P2025: Not found
      const notFoundError = new Error('Participant not found');
      notFoundError.statusCode = 404;
      throw notFoundError;
    }
    
    console.error(`Error fetching participant ${id}:`, error);
    const apiError = new Error('Failed to fetch participant');
    apiError.statusCode = 500;
    throw apiError;
  }
};

/**
 * Update a participant
 * @param {string} id - Participant ID (UUID)
 * @param {Object} updateData - Data to update
 * @param {string} [updateData.name] - New name (2-100 chars)
 * @param {string} [updateData.email] - New email (must be unique)
 * @returns {Promise<Object>} Updated participant
 * @throws {ApiError} If participant not found, validation fails, or email is in use
 */
const updateParticipant = async (id, updateData) => {
  try {
    const dataToUpdate = {};
    
    // Only include fields that are provided
    if (updateData.name) {
      dataToUpdate.name = updateData.name;
    }
    
    if (updateData.email) {
      dataToUpdate.email = updateData.email.toLowerCase();
    }
    
    // If no valid fields to update
    if (Object.keys(dataToUpdate).length === 0) {
      const validationError = new Error('No valid fields to update');
      validationError.statusCode = 400;
      throw validationError;
    }
    
    const updatedParticipant = await prisma.participant.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    return updatedParticipant;
  } catch (error) {
    if (error.code === 'P2025') {
      const notFoundError = new Error('Participant not found');
      notFoundError.statusCode = 404;
      throw notFoundError;
    }
    
    if (error.code === 'P2002') {
      const conflictError = new Error('Email already in use');
      conflictError.statusCode = 409;
      throw conflictError;
    }
    
    if (error.code === 'P2023') {
      const validationError = new Error('Invalid participant ID format');
      validationError.statusCode = 400;
      throw validationError;
    }
    
    console.error(`Error updating participant ${id}:`, error);
    const apiError = new Error('Failed to update participant');
    apiError.statusCode = 500;
    throw apiError;
  }
};

/**
 * Delete a participant
 * @param {string} id - Participant ID (UUID)
 * @returns {Promise<void>}
 * @throws {ApiError} If participant not found or deletion fails
 */
const deleteParticipant = async (id) => {
  try {
    // First check if participant exists to provide a more specific error
    const participant = await prisma.participant.findUnique({
      where: { id },
      select: { id: true }
    });
    
    if (!participant) {
      const notFoundError = new Error('Participant not found');
      notFoundError.statusCode = 404;
      throw notFoundError;
    }
    
    // Delete participant
    await prisma.participant.delete({
      where: { id }
    });
    
    // Note: All related event participations will be automatically deleted
    // due to the ON DELETE CASCADE constraint in the database
  } catch (error) {
    if (error.code === 'P2025' || error.code === 'P2023') {
      // P2025: Not found, P2023: Invalid ID format
      const notFoundError = new Error('Participant not found');
      notFoundError.statusCode = 404;
      throw notFoundError;
    }
    
    console.error(`Error deleting participant ${id}:`, error);
    const apiError = new Error('Failed to delete participant');
    apiError.statusCode = 500;
    throw apiError;
  }
};

module.exports = {
  createParticipant,
  getParticipants,
  getParticipantById,
  updateParticipant,
  deleteParticipant
};
