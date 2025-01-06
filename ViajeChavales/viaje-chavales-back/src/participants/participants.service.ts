import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db.service';

@Injectable()
export class ParticipantsService {

  constructor(private prisma: PrismaService) { }

  async create(tripId: number, username: string) {
    return await this.prisma.participant.create({data: { tripId, userId: username }});
  }

  async findAll(tripId: number) {
    return await this.prisma.participant.findMany({where: {tripId}});
  }

  async remove(userId: string, tripId: number) {
    return await this.prisma.participant.delete({where: {userId_tripId: {userId, tripId}}});
  }
}
