import { Request, Response, NextFunction } from 'express';
import { eventParticipantService } from './event-participant.service';
import { AddParticipantToEventDto, RemoveParticipantFromEventDto } from './dto/event-participant.dto';

export class EventParticipantController {
  async addParticipant(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.eventId;
      const { participantId } = req.body as AddParticipantToEventDto;

      const registration = await eventParticipantService.addParticipantToEvent(
        eventId,
        participantId
      );

      res.status(201).json({
        status: 'success',
        data: {
          registration: {
            id: registration.id,
            participant: {
              id: registration.participant.id,
              name: registration.participant.name,
              email: registration.participant.email,
            },
            registeredAt: registration.registeredAt,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async removeParticipant(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId, participantId } = req.params;

      await eventParticipantService.removeParticipantFromEvent(
        eventId,
        participantId
      );

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getParticipants(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.eventId;
      const participants = await eventParticipantService.getEventParticipants(eventId);

      res.json({
        status: 'success',
        results: participants.length,
        data: { participants },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const eventParticipantController = new EventParticipantController();
