import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { NOTES_ENDPOINT, environment } from 'src/env';
import { Note } from '../interfaces/note';
import { RestService } from './rest.service';

@Injectable({
  providedIn: 'root'
})
export class NotesService {

  constructor(private http: HttpClient, private restService: RestService, private toastr: ToastrService) { }

  token: string;
  url: string = environment.apiUrl;
  notes: string = NOTES_ENDPOINT.notes;
  add: string = NOTES_ENDPOINT.add;
  edit: string = NOTES_ENDPOINT.edit;

  async getNotes(filter):Promise<Note[] | false>{
/*     let queryParams = '';
    Object.keys(filter).forEach(key => {
      
    });
    if (queryParams.length > 0) {
      queryParams = queryParams.slice(0, -1);
    } */
    let params = new HttpParams()
    Object.keys(filter).forEach(key => {
      if (filter[key]) {
        params = params.set(`${key}`,`${filter[key]}`)
      }
    });
    /* const query = '?'.concat(queryParams); */
    const path = this.url.concat(this.notes);

    return await this.restService.get(path,params);
  }

  async getNoteToEdit(id: string):Promise<Note | false>{
    const endpoint = this.notes.concat(this.edit)
    const path = this.url.concat(endpoint.concat(id));
    return await this.restService.get(path);
  }

  async addNote(note):Promise<boolean>{
    const path = `${this.url}${this.notes}${this.add}`;
    const result = await this.restService.post(path,note);
    if(result === false){
      return false
    }return true
  }


  async editNote(id: string, note: Note):Promise<boolean>{
    const result = await this.restService.put(`http://localhost:3002/notes/edit/${id}`, note);
    if(result === false){
      return false
    }return true
  }

  removeNote(id: string):Observable<any>{
    return this.http.delete(`http://localhost:3002/notes/${id}`);
  }

}
