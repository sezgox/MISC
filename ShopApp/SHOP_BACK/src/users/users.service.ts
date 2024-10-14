import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/db.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

  constructor(private prisma: PrismaService){}

  async createUser(data: Prisma.UserCreateInput): Promise<User | HttpException> {

    try {
      const response = await this.prisma.user.create({data});
      return response
    } catch (error) {
      if(error.code==='P2002'){
        return new ConflictException(`User with ${error.meta.target} already in use`)
      }
      console.log(error)
      return error
    }

  }

  async userExists(email: Prisma.UserWhereUniqueInput): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({where: email});
      return user
    } catch (error) {
      console.log(error)
      return error
    }
  }

  async userById(id: Prisma.UserWhereUniqueInput): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({where: id});
      return user;
    } catch (error) {
      console.log(error.code)
      return error
    }
  }


  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
