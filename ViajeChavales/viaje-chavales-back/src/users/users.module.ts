import { Module } from '@nestjs/common';
import { PrismaService } from 'src/db.service';
import { GroupsService } from 'src/groups/groups.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, GroupsService],
})
export class UsersModule { }
