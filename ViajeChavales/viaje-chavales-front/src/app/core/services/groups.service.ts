import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../enviroment/enviroment';
import { Group } from '../interfaces/group.interface';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  constructor() { }

  private http = inject(HttpClient);

    private apiUrl = `${environment.apiUrl}/groups`;

    getGroupById(id: string): Promise<Group> {
      return lastValueFrom(this.http.get<Group>(`${this.apiUrl}/${id}`));
    }

    createGroup(name: string){
      return lastValueFrom(this.http.post<Group>(`${this.apiUrl}`, {name}))
    }
}
