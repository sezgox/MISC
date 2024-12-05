import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RegisterUserType } from '@interfaces/register-user';
import { User } from '@interfaces/user.interface';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private http = inject(HttpClient);

  private userSubject = new BehaviorSubject<User | null>(null);
  user$: Observable<User | null> = this.userSubject.asObservable();

  setCurrentUser(user: User): void {
    localStorage.setItem("CURRENT_USER", JSON.stringify(user));
    this.userSubject.next(user);
  }

  getCurrentUser(): User | null {
    return this.userSubject.getValue() ?? JSON.parse(localStorage.getItem("CURRENT_USER"));
  }

  clearCurrentUser(): void {
    localStorage.removeItem("CURRENT_USER");
    this.userSubject.next(null);
  }

  constructor() { }

  register(data: RegisterUserType){
    return this.http.post('http://localhost:3000/users', data);
  }

  userExists(email: string){
    return this.http.get(`http://localhost:3000/users?email=${email}`);
  }


}
