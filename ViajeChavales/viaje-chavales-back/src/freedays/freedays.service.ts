import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db.service';
import { CreateFreedayDto } from './dto/create-freeday.dto';
import { UpdateFreedayDto } from './dto/update-freeday.dto';

@Injectable()
export class FreedaysService {

  constructor(readonly prisma: PrismaService){ }

  async create(createFreedayDto: CreateFreedayDto) {
    try {
      const freeday = await this.prisma.freeDays.create({
        data: createFreedayDto,
      });
      return freeday;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async  findAll(username?: string, groupId?: string) {
    return this.prisma.freeDays.findMany({
      where: username
        ? groupId
          ? { username: { equals: username }, user: { memberships: { some: { groupId } } } }
          : { username: { equals: username } }
        : groupId
          ? { user: { memberships: { some: { groupId } } } }
          : undefined,
      orderBy: [{ username: 'asc' }, { startDate: 'asc' }],
    });
  }

  findOne(id: number) {
    try {
      return this.prisma.freeDays.findUnique({where: {id}});
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  update(id: number, updateFreedayDto: UpdateFreedayDto) {
    try {
      return this.prisma.freeDays.update({where: {id}, data: updateFreedayDto});
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  remove(id: number) {
    try {
      return this.prisma.freeDays.delete({where: {id}});
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
