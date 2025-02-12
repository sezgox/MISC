import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { GroupsService } from 'src/groups/groups.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly groupsService: GroupsService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const userExists = await this.usersService.findOne(createUserDto.username);
    if(userExists){
      await this.groupsService.remove(createUserDto.groupId);
      return new BadRequestException('Username in use, try another one');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    createUserDto.password = hashedPassword;
    const user = await this.usersService.create(createUserDto)
    await this.groupsService.addMember(createUserDto.groupId, user.username)
    return user;
  }

  @Get()
  async findAll(@Query('groupId') groupId: string, @Res() res: Response, @Req() req: Request) {
    if(!groupId){
      return res.status(400).json(new BadRequestException('You need to specify a groupId'));
    }
    const user = await this.usersService.findOne(req['user'].sub);
    if(user.groupId !== groupId){
      return res.status(401).json(new BadRequestException('You are not allowed to see this group'));
    }
    return res.json(await this.usersService.findAll(user.groupId));
  }

  @Get(':username')
  async findOne(@Param('username') username: string) {
    return await this.usersService.findOne(username);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(+id, updateUserDto);
  }

  @Delete(':username')
  async remove(@Param('username') username: string) {
    return await this.usersService.remove(username);
  }
}
