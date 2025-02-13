import { NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LOCAL_STORAGE_KEYS } from '../../../core/consts/local-storage-key';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgClass],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  router = inject(Router);
  toastr = inject(ToastrService)
  isMobile: boolean = false;
  showMenu: boolean = false;
  route = inject(ActivatedRoute)
  activeRoute: string = '';

  ngOnInit(): void {
    /* this.isMobile = window.innerWidth < 768; */
    this.route.url.subscribe(url => {
      this.activeRoute = url[0].path;
    });
  }

  logout(){
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS);
    this.router.navigate(['/login']);
  }

  toggleMenu(){
    this.toastr.clear();
    this.showMenu = !this.showMenu;
  }

  navigate(route: string){
    this.activeRoute = route;
    this.router.navigate([route]);
  }


}
