import { Request, Response, NextFunction } from 'express';
import { participantService } from './participant.service';
import { CreateParticipantDto, UpdateParticipantDto } from './dto/create-participant.dto';

export class ParticipantController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const participant = await participantService.create(req.body as CreateParticipantDto);
      res.status(201).json({
        status: 'success',
        data: { participant },
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const participants = await participantService.findAll();
      res.json({
        status: 'success',
        results: participants.length,
        data: { participants },
      });
    } catch (error) {
      next(error);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const participant = await participantService.findOne(req.params.id);
      res.json({
        status: 'success',
        data: { participant },
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const participant = await participantService.update(
        req.params.id,
        req.body as UpdateParticipantDto
      );
      res.json({
        status: 'success',
        data: { participant },
      });
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await participantService.remove(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const participantController = new ParticipantController();
