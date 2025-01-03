import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../enviroment/enviroment';
import { CreateFreedayDto, Freedays } from '../interfaces/freedays.interface';

@Injectable({
  providedIn: 'root'
})
export class FreedaysService {

  constructor() { }

  http = inject(HttpClient);
  apiUrl = `${environment.apiUrl}/freedays`;

  getFreedays(username?: string): Promise<Freedays[]>{
    const path = username ? `${this.apiUrl}${'?username='+username}` : `${this.apiUrl}`;
    return lastValueFrom(this.http.get<Freedays[]>(path));
  }

  addFreeday(freeday: CreateFreedayDto): Promise<Freedays>{
    return lastValueFrom(this.http.post<Freedays>(this.apiUrl, freeday));
  }

  removeFreeday(id: number): Promise<Freedays>{
    return lastValueFrom(this.http.delete<Freedays>(`${this.apiUrl}/${id}`));
  }

  updateFreeday( Freeday: Freedays): Promise<Freedays>{
    return lastValueFrom(this.http.patch<Freedays>(`${this.apiUrl}/${Freeday.id}`, Freeday));
  }
}
