import { IsUUID } from 'class-validator';

export class AddParticipantToEventDto {
  @IsUUID()
  participantId: string;
}

export class RemoveParticipantFromEventDto {
  @IsUUID()
  participantId: string;
}
