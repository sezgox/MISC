import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const userExists = await this.usersService.findOneWithPassword(createUserDto.username);

    if (userExists) {
      throw new BadRequestException('Username in use, try another one');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    return this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  @Get()
  async findAll(@Req() req: Request) {
    return this.usersService.findAll(req['user'].group);
  }

  @Get('me')
  async me(@Req() req: Request) {
    return this.usersService.findOne(req['user'].sub);
  }

  @Get(':username')
  async findOne(@Param('username') username: string, @Req() req: Request) {
    const user = await this.usersService.findOne(username);

    if (!user || user.groupId !== req['user'].group) {
      throw new BadRequestException('User not found in this group');
    }

    return user;
  }

  @Patch(':username/role')
  async updateRole(
    @Param('username') username: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @Req() req: Request,
  ) {
    return this.usersService.updateRole(req['user'].sub, username, updateUserRoleDto.userRole);
  }

  @Delete(':username')
  async remove(@Param('username') username: string, @Req() req: Request) {
    return this.usersService.remove(req['user'].sub, username);
  }
}
