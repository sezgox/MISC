import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RegisterUserType, UserCredentials } from '../core/interfaces/register-user';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private http = inject(HttpClient);

  constructor() { }

  register(data: RegisterUserType){
    return this.http.post('http://localhost:3000/users', data);
  }

  userExists(email: string){
    return this.http.get(`http://localhost:3000/users?email=${email}`);
  }


}
