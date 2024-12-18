import { Module } from '@nestjs/common';
import { PrismaService } from 'src/db.service';
import { FreedaysService } from 'src/freedays/freedays.service';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';

@Module({
  controllers: [TripsController],
  providers: [TripsService, PrismaService, FreedaysService],
})
export class TripsModule {

}
