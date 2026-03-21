import { Injectable } from '@nestjs/common';
import { TripsService } from 'src/trips/trips.service';

@Injectable()
export class ParticipantsService {
  constructor(private readonly tripsService: TripsService) {}

  async create(tripId: number, username: string) {
    return this.tripsService.addParticipant(tripId, username);
  }

  async findAll(tripId: number) {
    return this.tripsService.getTripParticipants(tripId);
  }

  async remove(userId: string, tripId: number) {
    return this.tripsService.removeParticipant(tripId, userId);
  }
}
