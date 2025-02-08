import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db.service';

@Injectable()
export class ParticipantsService {

  constructor(private prisma: PrismaService) { }

  async create(tripId: number, username: string) {
    try {
      return await this.prisma.participant.create({data: { tripId, userId: username }});
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll(tripId: number) {
    try{
      return await this.prisma.participant.findMany({where: {tripId}});
    }catch(error){
      throw new BadRequestException(error);
      
    }
  }

  async remove(userId: string, tripId: number) {
    try {
    return await this.prisma.participant.delete({where: {userId_tripId: {userId, tripId}}});
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
