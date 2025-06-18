import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateParticipantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class UpdateParticipantDto {
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsEmail()
  @IsNotEmpty()
  email?: string;
}
