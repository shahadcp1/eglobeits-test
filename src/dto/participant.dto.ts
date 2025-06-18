import { IsString, IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

export class AddParticipantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class RemoveParticipantDto {
  @IsUUID()
  @IsNotEmpty()
  participantId: string;
}

export class GetEventParticipantsDto {
  @IsUUID()
  @IsNotEmpty()
  eventId: string;
}
