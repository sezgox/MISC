import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {

  constructor(private readonly prisma: PrismaService){}

  create(createGroupDto: CreateGroupDto) {
    try {
      return this.prisma.group.create({data:createGroupDto})
    } catch (error) {
      return new BadRequestException(error)
    }
  }

  findAll() {
    return this.prisma.group.findMany();
  }

  findOne(id: string) {
    return this.prisma.group.findUnique({
      where: {id},
      include: {
        members: true
      }
    });
  }

  update(id: number, updateGroupDto: UpdateGroupDto) {
    return `This action updates a #${id} group`;
  }

  remove(id: string) {
    return this.prisma.group.delete({where: {id}});
  }

  addMember(id: string, username: string){
    return this.prisma.group.update({where: {id}, data: {members: {connect: {username}}}});
  }
}
