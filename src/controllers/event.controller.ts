import { Request, Response } from 'express';
import {
  createEvent as createEventService,
  getEvents as getEventsService,
  getEventById as getEventByIdService,
  updateEvent as updateEventService,
  deleteEvent as deleteEventService,
  eventExists,
  PaginationOptions
} from '../services/event.service';

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management
 */

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, description, eventDate, capacity } = req.body;
    
    if (!title || !description || !eventDate || !capacity) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const event = await createEventService({
      title,
      description,
      eventDate: new Date(eventDate),
      capacity: parseInt(capacity, 10),
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event' });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '10' } = req.query as unknown as PaginationOptions;
    const pageNum = parseInt(page.toString(), 10) || 1;
    const limitNum = parseInt(limit.toString(), 10) || 10;

    const result = await getEventsService({ page: pageNum, limit: limitNum });
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await getEventByIdService(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Error fetching event' });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!await eventExists(id)) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const updatedEvent = await updateEventService(id, updateData);
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Error updating event' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!await eventExists(id)) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await deleteEventService(id);
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event' });
  }
};
