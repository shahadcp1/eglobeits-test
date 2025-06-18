import { PrismaClient, Participant } from '@prisma/client';
import { CreateParticipantDto, UpdateParticipantDto } from './dto/create-participant.dto';
import { NotFoundError } from '../../utils/errors';

const prisma = new PrismaClient();

export class ParticipantService {
  async findAll(): Promise<Participant[]> {
    return prisma.participant.findMany();
  }

  async findOne(id: string): Promise<Participant> {
    const participant = await prisma.participant.findUnique({
      where: { id },
    });

    if (!participant) {
      throw new NotFoundError('Participant not found');
    }

    return participant;
  }

  async create(createParticipantDto: CreateParticipantDto): Promise<Participant> {
    return prisma.participant.create({
      data: {
        ...createParticipantDto,
        email: createParticipantDto.email.toLowerCase(),
      },
    });
  }

  async update(id: string, updateParticipantDto: UpdateParticipantDto): Promise<Participant> {
    await this.findOne(id); // Check if participant exists
    
    return prisma.participant.update({
      where: { id },
      data: {
        ...updateParticipantDto,
        ...(updateParticipantDto.email && { email: updateParticipantDto.email.toLowerCase() }),
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if participant exists
    
    await prisma.participant.delete({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<Participant | null> {
    return prisma.participant.findUnique({
      where: { email: email.toLowerCase() },
    });
  }
}

export const participantService = new ParticipantService();
