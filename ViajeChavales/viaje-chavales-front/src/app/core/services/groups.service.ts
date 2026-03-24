import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../enviroment/enviroment';
import { Group, GroupInvitePreview } from '../interfaces/group.interface';

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

    getGroupInvitePreview(id: string): Promise<GroupInvitePreview | null> {
      return lastValueFrom(this.http.get<GroupInvitePreview | null>(`${this.apiUrl}/${id}/invite`));
    }

    createGroup(name: string){
      return lastValueFrom(this.http.post<Group>(`${this.apiUrl}`, {name}))
    }

  /**
   * Disuelve el grupo (solo backend autoriza a admins). Requiere cabecera X-Group-Id.
   */
  dissolveGroup(groupId: string): Promise<{ ok: boolean; groupId: string }> {
    return lastValueFrom(
      this.http.delete<{ ok: boolean; groupId: string }>(`${this.apiUrl}/${groupId}`, {
        headers: new HttpHeaders({ 'X-Group-Id': groupId }),
      }),
    );
  }
}
