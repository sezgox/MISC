import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';



@Injectable()
export class UsersService {

  constructor(private readonly prisma: PrismaService){}


  async create(user: CreateUserDto) {
    try {
      return await this.prisma.user.create({data: user});
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll(groupId: string) {
    return await this.prisma.user.findMany({where: {groupId}});
  }

  async findOne(username: string) {
    return await this.prisma.user.findUnique({where: {username}});
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(username: string): Promise<any> {
    try{
      await this.prisma.user.delete({
        where: { username },
      });
      return Promise.resolve(`User ${username} deleted`);
    }catch{
      return Promise.resolve(`User ${username} not found`);
    }
  }
}
