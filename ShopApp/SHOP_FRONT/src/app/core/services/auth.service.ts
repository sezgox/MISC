import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserCredentials } from '@interfaces/register-user';
import { User } from '@interfaces/user.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  private http = inject(HttpClient);

  signIn(data: UserCredentials): Observable<{jwt: string, userData: User}>{
    return this.http.post<{jwt: string, userData: User}>('http://localhost:3000/auth', data);
  }
}
