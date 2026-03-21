import { HttpClient } from '@angular/common/http';
import { EventEmitter, inject, Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { LOCAL_STORAGE_KEYS } from '../consts/local-storage-key';
import { environment } from '../enviroment/enviroment';
import { AccessToken } from '../interfaces/login-response';
import { User, UserCredentials, UserProfile, UserRole } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  loggedIn: EventEmitter<boolean> = new EventEmitter();

  registerUser(user: User): Observable<UserProfile> {
    return this.http.post<UserProfile>(this.apiUrl, user);
  }

  loginUser(user: UserCredentials): Observable<AccessToken> {
    return this.http.post<AccessToken>(`${environment.apiUrl}/auth`, user);
  }

  getUser(username: string): Promise<UserProfile> {
    return lastValueFrom(this.http.get<UserProfile>(`${this.apiUrl}/${username}`));
  }

  getCurrentUser(): Promise<UserProfile> {
    return lastValueFrom(this.http.get<UserProfile>(`${this.apiUrl}/me`));
  }

  getUsers(): Promise<UserProfile[]> {
    return lastValueFrom(this.http.get<UserProfile[]>(this.apiUrl));
  }

  updateUserRole(username: string, userRole: UserRole): Promise<UserProfile> {
    return lastValueFrom(
      this.http.patch<UserProfile>(`${this.apiUrl}/${username}/role`, { userRole }),
    );
  }

  removeUser(username: string): Promise<UserProfile> {
    return lastValueFrom(this.http.delete<UserProfile>(`${this.apiUrl}/${username}`));
  }

  getUsername(): string {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.USER_DATA) ?? '';
  }

  getAccessToken(): string {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS) ?? '';
  }
}
