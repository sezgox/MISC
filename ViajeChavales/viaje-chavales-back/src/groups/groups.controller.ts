import { Body, Controller, Delete, Get, Param, Post, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@Body() group: { name: string }) {
    const id = uuidv4();
    return this.groupsService.create(id, group.name);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Get(':id/invite')
  findInvitePreview(@Param('id') id: string) {
    return this.groupsService.findInvitePreview(id);
  }

  @Delete(':id')
  async dissolve(@Param('id') id: string, @Req() req: Request) {
    const username = req['user']?.sub as string | undefined;
    if (!username) {
      throw new UnauthorizedException();
    }
    return this.groupsService.dissolveGroup(id, username);
  }
}
