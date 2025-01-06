import { Module } from '@nestjs/common';
import { PrismaService } from 'src/db.service';
import { TripsService } from 'src/trips/trips.service';
import { ParticipantsController } from './participants.controller';
import { ParticipantsService } from './participants.service';

@Module({
  controllers: [ParticipantsController],
  providers: [ParticipantsService, TripsService, PrismaService],
})
export class ParticipantsModule {}
