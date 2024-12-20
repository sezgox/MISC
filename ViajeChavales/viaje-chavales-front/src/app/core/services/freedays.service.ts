import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Freedays } from '../interfaces/freedays.interface';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class FreedaysService {

  constructor() { }

  http = inject(HttpClient);
  tokenService = inject(TokenService)

  getFreedays(): Observable<Freedays[]>{
    return this.http.get<Freedays[]>('http://localhost:3000/freedays',{headers: this.tokenService.getHeader()});
  }
}
