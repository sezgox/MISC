import { Injectable } from '@angular/core';
import { UsersService } from './users.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  display: boolean = false;
  logged: boolean = false;

  constructor(private usersService: UsersService) { }

  async showNav(){
    const auth = await this.usersService.isAuth();
    this.logged = auth;
  }
  
  isDesktop(){
    this.display = window.innerWidth >= 1024 ? true : false;
  }

  toggle(){
    this.display = !this.display;
  }
}
