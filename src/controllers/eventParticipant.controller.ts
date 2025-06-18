import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as eventParticipantService from '../services/eventParticipant.service';
import { AddParticipantDto } from '../dto/participant.dto';
import { ValidationError } from '../utils/errors';

interface CustomRequest<T = any> extends Request {
  body: T;
}

/**
 * Add a participant to an event
 */
const addParticipant = async (req: CustomRequest<AddParticipantDto>, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array().reduce((acc, { param, msg }) => ({
      ...acc,
      [param]: [...(acc[param] || []), msg]
    }), {}));
  }

  const eventId = req.params.eventId;
  const participantData: AddParticipantDto = {
    name: req.body.name,
    email: req.body.email.toLowerCase(),
  };

  const result = await eventParticipantService.addParticipantToEvent(eventId, participantData);
  
  res.status(201).json({
    status: 'success',
    data: {
      registration: {
        id: result.id,
        participant: {
          id: result.participant.id,
          name: result.participant.name,
          email: result.participant.email,
        },
        registeredAt: result.registeredAt,
      },
    },
  });
};

/**
 * Remove a participant from an event
 */
const removeParticipant = async (req: Request, res: Response) => {
  const eventId = req.params.eventId;
  const participantId = req.params.participantId;
  
  if (!eventId || !participantId) {
    throw new ValidationError({
      eventId: ['Event ID is required'],
      participantId: ['Participant ID is required'],
    });
  }

  await eventParticipantService.removeParticipantFromEvent(eventId, participantId);
  
  res.status(200).json({
    status: 'success',
    data: {
      message: 'Participant removed from event successfully',
    },
  });
};

/**
 * Get all participants for an event
 */
const getParticipants = async (req: Request, res: Response) => {
  const eventId = req.params.eventId;
  const result = await eventParticipantService.getEventParticipants(eventId);
  
  res.status(200).json({
    status: 'success',
    data: result,
  });
};

export { addParticipant, removeParticipant, getParticipants };
