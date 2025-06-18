import { Request, Response, NextFunction } from 'express';
import {
  createParticipant as createParticipantService,
  getParticipants as getParticipantsService,
  getParticipantById as getParticipantByIdService,
  updateParticipant as updateParticipantService,
  deleteParticipant as deleteParticipantService,
  participantExists,
  PaginationOptions,
  CreateParticipantInput,
  UpdateParticipantInput,
} from '../services/participant.service';
import { ValidationError } from '../utils/errors';
import { validationResult } from 'express-validator';

/**
 * @swagger
 * tags:
 *   name: Participants
 *   description: Participant management
 */

const validateRequest = (req: Request) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages: Record<string, string[]> = {};
    errors.array().forEach((error) => {
      const field = error.param;
      if (!errorMessages[field]) {
        errorMessages[field] = [];
      }
      errorMessages[field].push(error.msg);
    });
    throw new ValidationError(errorMessages);
  }
};

export const createParticipant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    validateRequest(req);
    
    const { name, email } = req.body;
    const { eventId } = req.params;

    const participant = await createParticipantService({
      name,
      email,
      eventId,
    });

    res.status(201).json({
      status: 'success',
      data: participant,
    });
  } catch (error) {
    next(error);
  }
};

export const getParticipants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getParticipantsService(eventId, { page, limit });
    
    res.status(200).json({
      status: 'success',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getParticipant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const participant = await getParticipantByIdService(id);
    
    res.status(200).json({
      status: 'success',
      data: participant,
    });
  } catch (error) {
    next(error);
  }
};

export const updateParticipant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    validateRequest(req);
    
    const { id } = req.params;
    const { name, email } = req.body;

    const participant = await updateParticipantService(id, { name, email });
    
    res.status(200).json({
      status: 'success',
      data: participant,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteParticipant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    await deleteParticipantService(id);
    
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const checkParticipantExistence = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const exists = await participantExists(id);
    
    if (!exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Participant not found',
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
