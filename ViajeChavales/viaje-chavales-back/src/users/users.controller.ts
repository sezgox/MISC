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
    return this.usersService.findOne(req['user'].sub, req['user'].group);
  }

  @Get('groups')
  async groups(@Req() req: Request) {
    return this.usersService.listGroups(req['user'].sub);
  }

  @Patch('active-group')
  async setActiveGroup(@Body() body: { groupId: string }, @Req() req: Request) {
    if (!body.groupId) {
      throw new BadRequestException('groupId is required');
    }

    return this.usersService.setActiveGroup(req['user'].sub, body.groupId);
  }

  @Post('groups/:groupId/join')
  async joinGroup(@Param('groupId') groupId: string, @Req() req: Request) {
    return this.usersService.joinGroup(req['user'].sub, groupId);
  }

  @Get(':username')
  async findOne(@Param('username') username: string, @Req() req: Request) {
    return this.usersService.findOne(username, req['user'].group);
  }

  @Patch(':username/role')
  async updateRole(
    @Param('username') username: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @Req() req: Request,
  ) {
    return this.usersService.updateRole(
      req['user'].sub,
      username,
      updateUserRoleDto.userRole,
      req['user'].group,
    );
  }

  @Delete(':username')
  async remove(@Param('username') username: string, @Req() req: Request) {
    return this.usersService.remove(req['user'].sub, username, req['user'].group);
  }
}
