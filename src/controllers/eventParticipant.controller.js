const eventParticipantService = require('../services/eventParticipant.service');

/**
 * Register a participant to an event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const registerParticipant = async (req, res, next) => {
  try {
    const { eventId, participantId } = req.params;
    const registration = await eventParticipantService.registerParticipant(eventId, participantId);
    
    res.status(201).json({
      status: 'success',
      data: registration
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a participant from an event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const removeParticipant = async (req, res, next) => {
  try {
    const { eventId, participantId } = req.params;
    await eventParticipantService.removeParticipant(eventId, participantId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

/**
 * Get all participants for an event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getEventParticipants = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await eventParticipantService.getEventParticipants(eventId, { page, limit });
    
    res.status(200).json({
      status: 'success',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all events for a participant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getParticipantEvents = async (req, res, next) => {
  try {
    const { participantId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await eventParticipantService.getParticipantEvents(participantId, { page, limit });
    
    res.status(200).json({
      status: 'success',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerParticipant,
  removeParticipant,
  getEventParticipants,
  getParticipantEvents
};
