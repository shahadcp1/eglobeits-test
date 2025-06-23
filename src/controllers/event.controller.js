const eventService = require('../services/event.service');
const { validationResult } = require('express-validator');

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Public
 */
const createEvent = async (req, res, next) => {
  try {
    const event = await eventService.createEvent(req.body);
    
    res.status(201).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/events
 * @desc    Get all events with pagination
 * @access  Public
 */
const getEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';

    const result = await eventService.getEvents({
      page,
      limit,
      sortBy,
      sortOrder
    });

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
 * @route   GET /api/events/:id
 * @desc    Get event by ID
 * @access  Public
 */
const getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    
    res.status(200).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/events/:id
 * @desc    Update an event
 * @access  Public
 */
const updateEvent = async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);
    
    res.status(200).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event
 * @access  Public
 */
const deleteEvent = async (req, res, next) => {
  try {
    await eventService.deleteEvent(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent
};
