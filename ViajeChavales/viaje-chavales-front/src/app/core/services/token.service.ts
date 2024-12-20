import { Injectable } from '@angular/core';
import { LOCAL_STORAGE_ACCESS_KEY } from '../consts/local-storage-key';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor() { }

    getToken(){
      const token = localStorage.getItem(LOCAL_STORAGE_ACCESS_KEY);
      return token;
    }

    getHeader(){
      const header =  {
        Authorization: `Bearer ${this.getToken()}`
      }
      return header;
    }
}
