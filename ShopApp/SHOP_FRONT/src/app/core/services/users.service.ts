import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RegisterUserType } from '@interfaces/register-user';
import { User } from '@interfaces/user.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { localStorageKeys } from '../consts/local-storage';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private http = inject(HttpClient);

  private userSubject = new BehaviorSubject<User | null>(null);
  user$: Observable<User | null> = this.userSubject.asObservable();

  setCurrentUser(user: User): void {
    localStorage.setItem(localStorageKeys.USER_DATA, JSON.stringify(user));
    this.userSubject.next(user);
  }

  getCurrentUser(): User | null {
    return this.userSubject.getValue() ?? JSON.parse(localStorage.getItem(localStorageKeys.USER_DATA));
  }

  clearCurrentUser(): void {
    localStorage.removeItem(localStorageKeys.USER_DATA);
    this.userSubject.next(null);
  }

  constructor() { }

  register(data: RegisterUserType):Observable<User>{
    return this.http.post<User>('http://localhost:3000/users', data);
  }

  userExists(email: string):Observable<User>{
    return this.http.get<User>(`http://localhost:3000/users?email=${email}`);
  }


}
