import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { v4 as uuidv4 } from "uuid";
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@Body() group: {name: string}) {
    const id = uuidv4();
    return this.groupsService.create(id,group.name);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(+id);
  }
}
