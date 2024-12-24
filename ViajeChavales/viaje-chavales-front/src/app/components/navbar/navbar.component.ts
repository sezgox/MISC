import { NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LOCAL_STORAGE_ACCESS_KEY } from '../../core/consts/local-storage-key';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgClass],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  router = inject(Router);
  isMobile: boolean = false;
  showMenu: boolean = false;
  route = inject(ActivatedRoute)
  activeRoute: string = '';

  ngOnInit(): void {
    this.isMobile = window.innerWidth < 768;
    this.route.url.subscribe(url => {
      this.activeRoute = url[0].path;
    });
  }

  logout(){
    localStorage.removeItem(LOCAL_STORAGE_ACCESS_KEY);
    this.router.navigate(['/login']);
  }

  toggleMenu(){
    this.showMenu = !this.showMenu;
  }

  navigate(route: string){
    this.activeRoute = route;
    this.router.navigate([route]);
  }


}
