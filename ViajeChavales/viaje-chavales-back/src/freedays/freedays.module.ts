import { Module } from '@nestjs/common';
import { PrismaService } from 'src/db.service';
import { FreedaysController } from './freedays.controller';
import { FreedaysService } from './freedays.service';

@Module({
  controllers: [FreedaysController],
  providers: [FreedaysService, PrismaService],
})
export class FreedaysModule {}
