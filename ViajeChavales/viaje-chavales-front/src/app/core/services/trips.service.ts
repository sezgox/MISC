import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Trip } from '../interfaces/trips.interface';

@Injectable({
  providedIn: 'root'
})
export class TripsService {

  constructor() { }

  http = inject(HttpClient);

  getTrips(): Observable<Trip[]>{
    return this.http.get<Trip[]>("http://localhost:3000/trips");
  }
}
