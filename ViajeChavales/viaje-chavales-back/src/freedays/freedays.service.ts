import { BadRequestException, Injectable } from '@nestjs/common';
import { ensureApprovedUser } from 'src/core/utils/trip-domain';
import { PrismaService } from 'src/db.service';
import { CreateFreedayDto } from './dto/create-freeday.dto';
import { UpdateFreedayDto } from './dto/update-freeday.dto';

@Injectable()
export class FreedaysService {

  constructor(readonly prisma: PrismaService){ }

  async assertUserCanEdit(username: string) {
    await ensureApprovedUser(this.prisma, username);
  }

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
        ? { username: { equals: username } }
        : groupId
          ? { user: { groupId } }
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
