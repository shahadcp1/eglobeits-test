const participantService = require('../services/participant.service');

/**
 * Create a new participant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const createParticipant = async (req, res, next) => {
  try {
    const participant = await participantService.createParticipant(req.body);
    res.status(201).json({
      status: 'success',
      data: participant
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all participants
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getParticipants = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await participantService.getParticipants({ page, limit });
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
 * Get a single participant by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getParticipant = async (req, res, next) => {
  try {
    const participant = await participantService.getParticipantById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: participant
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a participant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateParticipant = async (req, res, next) => {
  try {
    const participant = await participantService.updateParticipant(
      req.params.id,
      req.body
    );
    res.status(200).json({
      status: 'success',
      data: participant
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a participant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const deleteParticipant = async (req, res, next) => {
  try {
    await participantService.deleteParticipant(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createParticipant,
  getParticipants,
  getParticipant,
  updateParticipant,
  deleteParticipant
};
