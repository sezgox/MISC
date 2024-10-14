import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  apiRoute: string = environment.apiUrl;
  //apiRoute: string = 'https://nolob.onrender.com/'

  login(username: string,password: string):Observable<any>{
    return this.http.post(`${this.apiRoute}/users/login`,{username,password})
  }

}
