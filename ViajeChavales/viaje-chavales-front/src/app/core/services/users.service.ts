import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { LOCAL_STORAGE_KEYS } from '../consts/local-storage-key';
import { AccessToken } from '../interfaces/login-response';
import { User, UserCredentials } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor() { }

  private http = inject(HttpClient);

  loginUser(user: UserCredentials): Observable<AccessToken>{
    return this.http.post<AccessToken>('http://localhost:3001/auth',user);
  }

  getUser(username: string): Promise<User>{
    return lastValueFrom(this.http.get<User>(`http://localhost:3001/users/${username}`));
  }

  getUsers(): Promise<User[]> {
    return lastValueFrom(this.http.get<User[]>('http://localhost:3001/users'));
  }

  updateUsers(): Observable<any>{
    return this.http.post('http://localhost:3001/users',{});
  }

  getUsername(): string{
    const username = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_DATA)
    return username ? username : '';
  }

}
