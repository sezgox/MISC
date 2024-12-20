import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Trip } from '../interfaces/trips.interface';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class TripsService {

  constructor() { }

  http = inject(HttpClient);
  tokenService = inject(TokenService);

  getTrips(): Observable<Trip[]>{
    return this.http.get<Trip[]>("http://localhost:3000/trips",{headers: this.tokenService.getHeader()});
  }
}
