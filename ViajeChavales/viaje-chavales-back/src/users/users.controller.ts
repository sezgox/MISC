import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Req, Res } from '@nestjs/common';
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
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const userExists = await this.usersService.findOne(createUserDto.username);
    const group = await this.groupsService.findOne(createUserDto.groupId);
    if(userExists){
      if(group.members.length == 0){
        await this.groupsService.remove(createUserDto.groupId);
      }
      return res.status(400).json(new BadRequestException('Username in use, try another one'));
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    createUserDto.password = hashedPassword;
    const user = await this.usersService.create(createUserDto)
    await this.groupsService.addMember(createUserDto.groupId, user.username)
    return res.json(user);
  }

  @Get()
  async findAll( @Res() res: Response, @Req() req: Request) {
    const groupId = req['user'].group;
    return res.json(await this.usersService.findAll(groupId));
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
