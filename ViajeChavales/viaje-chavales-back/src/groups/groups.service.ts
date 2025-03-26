import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db.service';

@Injectable()
export class GroupsService {

  constructor(private prisma: PrismaService) {}

  async create(id: string, name: string) {
    return this.prisma.group.create({data:{id, name}});
  }

  findOne(id: string) {
    return this.prisma.group.findUnique({where: {id}});
  }

  update(id: number, username: string) {
    return `This action updates a #${id} group`;
  }

  remove(id: number) {
    return `This action removes a #${id} group`;
  }
}
