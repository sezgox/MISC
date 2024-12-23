import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessToken } from '../interfaces/login-response';
import { User, UserCredentials } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor() { }

  http = inject(HttpClient);

  loginUser(user: UserCredentials): Observable<AccessToken>{
    return this.http.post<AccessToken>('http://localhost:3000/auth',user);
  }

  getUser(username: string): Observable<User>{
    return this.http.get<User>(`http://localhost:3000/users/${username}`);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('http://localhost:3000/users');
  }

  updateUsers(): Observable<any>{
    return this.http.post('http://localhost:3000/users',{});
  }

}
