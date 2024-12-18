import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db.service';
import { CreateFreedayDto } from './dto/create-freeday.dto';
import { UpdateFreedayDto } from './dto/update-freeday.dto';

@Injectable()
export class FreedaysService {

  constructor(readonly prisma: PrismaService){ }

  async create(createFreedayDto: CreateFreedayDto) {
    const freeday = await this.prisma.freeDays.create({
      data: createFreedayDto,
    });
    return freeday;
  }

  async  findAll(username: string) {
    return username ? await this.prisma.freeDays.findMany({where: {username: {equals: username}}}) : await this.prisma.freeDays.findMany();
  }

  findOne(id: number) {
    return this.prisma.freeDays.findUnique({where: {id}});
  }

  update(id: number, updateFreedayDto: UpdateFreedayDto) {
    return this.prisma.freeDays.update({where: {id}, data: updateFreedayDto});
  }

  remove(id: number) {
    return this.prisma.freeDays.delete({where: {id}});
  }
}
