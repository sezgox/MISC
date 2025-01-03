import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../enviroment/enviroment';
import { CreateTripDto, Trip } from '../interfaces/trips.interface';

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
}
