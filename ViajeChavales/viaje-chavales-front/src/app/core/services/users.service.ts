import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';
import { AccessToken } from '../interfaces/login-response';
import { User, UserCredentials } from '../interfaces/user.interface';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor() { }

  http = inject(HttpClient);
  tokenService = inject(TokenService);

  getLoggedInUsername(){
    const token = this.tokenService.getToken();
    return token ? jwtDecode(token).sub : null;
  }

  loginUser(user: UserCredentials): Observable<AccessToken>{
    return this.http.post<AccessToken>('http://localhost:3000/auth',user);
  }

  getUser(username: string): Observable<User>{
    return this.http.get<User>(`http://localhost:3000/users/${username}`,{headers: this.tokenService.getHeader()} );
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('http://localhost:3000/users',{headers: this.tokenService.getHeader()} );
  }

  updateUsers(): Observable<any>{
    return this.http.post('http://localhost:3000/users',{});
  }

}
