import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserCredentials } from '@interfaces/register-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  private http = inject(HttpClient);
  
  signIn(data: UserCredentials){
    return this.http.post('http://localhost:3000/auth',data)
  }
}
