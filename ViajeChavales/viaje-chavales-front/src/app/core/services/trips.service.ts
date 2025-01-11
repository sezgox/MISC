import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../enviroment/enviroment';
import { Comment, CreateTripDto, Participants, Trip } from '../interfaces/trips.interface';

@Injectable({
  providedIn: 'root'
})
export class TripsService {

  constructor() { }

  http = inject(HttpClient);
  apiUrl = `${environment.apiUrl}/trips`;

  getTrips(): Promise<Trip[]>{
    return lastValueFrom(this.http.get<Trip[]>(this.apiUrl));
  }

  addTrip(trip: CreateTripDto): Promise<Trip> {
    return lastValueFrom(this.http.post<Trip>(this.apiUrl, trip));
  }

  getParticipants(tripId: number): Promise<Participants[]>{
    return lastValueFrom(this.http.get<Participants[]>(`${environment.apiUrl}/participants?tripId=${tripId}`));
  }

  removeTrip(tripId:number): Promise<Trip>{
    return lastValueFrom(this.http.delete<Trip>(`${this.apiUrl}/${tripId}`));
  }

  getById(tripId: number): Promise<Trip>{
    return lastValueFrom(this.http.get<Trip>(`${this.apiUrl}/${tripId}`));
  }

  addComment(comment: Comment): Promise<Comment>{
    return lastValueFrom(this.http.post<Comment>(`${environment.apiUrl}/comments`, comment));
  }

  getComments(tripId:number): Promise<Comment[]>{
    return lastValueFrom(this.http.get<Comment[]>(`${environment.apiUrl}/comments/${tripId}`));
  }

  updateTrip(trip: Trip): Promise<Trip> {
    return lastValueFrom(this.http.patch<Trip>(`${environment.apiUrl}/trips/${trip.id}`, trip));
  }
}
