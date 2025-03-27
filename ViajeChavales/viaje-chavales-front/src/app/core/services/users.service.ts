import { HttpClient } from '@angular/common/http';
import { EventEmitter, inject, Injectable } from '@angular/core';
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

  apiUrl = 'http://localhost:3000';

  loggedIn: EventEmitter<boolean> = new EventEmitter();

  registerUser(user: User): Observable<User>{
    return this.http.post<User>(`${this.apiUrl}/users`,user);
  }

  loginUser(user: UserCredentials): Observable<AccessToken>{
    return this.http.post<AccessToken>(`${this.apiUrl}/auth`,user);
  }

  getUser(username: string): Promise<User>{
    return lastValueFrom(this.http.get<User>(`${this.apiUrl}/users/${username}`));
  }

  getUsers(): Promise<User[]> {
    return lastValueFrom(this.http.get<User[]>(`${this.apiUrl}/users`));
  }

  updateUsers(): Observable<any>{
    return this.http.post(`${this.apiUrl}/users`,{});
  }

  getUsername(): string{
    const username = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_DATA)
    return username ? username : '';
  }

}
