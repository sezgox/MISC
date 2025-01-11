import { Module } from '@nestjs/common';
import { PrismaService } from 'src/db.service';
import { TripsService } from 'src/trips/trips.service';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, PrismaService, TripsService],
})
export class CommentsModule {}
