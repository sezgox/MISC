import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Injectable()
export class TripsService {

  constructor(readonly prisma: PrismaService){}

  async create(createTripDto: CreateTripDto) {
    return await this.prisma.trip.create({data:createTripDto});
  }

  async findAll(username?: string) {
    return username ? await this.prisma.trip.findMany({where: {userId: username}}) : await this.prisma.trip.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.trip.findUnique({where: {id}});
  }

  async update(id: number, updateTripDto: UpdateTripDto) {
    return await this.prisma.trip.update({where: {id}, data: updateTripDto});
  }

  async remove(id: number) {
    return await this.prisma.trip.delete({where: {id}});
  }
}
