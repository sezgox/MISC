import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { SimpleResponse, UserResponse } from '../types/back/my-response';
import { LogUser } from '../types/users/users-types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) { }

  url = 'http://localhost:3005/auth'

  register(user:LogUser):Observable<UserResponse>{
    console.log(this.url)
    return this.http.post<UserResponse>(this.url,user);
  }

  login(user:LogUser):Observable<SimpleResponse>{
    const path = this.url.concat('/login')
    return this.http.post<SimpleResponse>(path,user);
  }

  isAuth():boolean{
    const token = localStorage.getItem('AUTH_TOKEN');
    if(token){
      return true
    }return false
  }


}
