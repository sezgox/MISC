import { NgClass } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { LOCAL_STORAGE_KEYS } from '../../../core/consts/local-storage-key';
import { ActiveGroupService } from '../../../core/services/active-group.service';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgClass],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  router = inject(Router);
  usersService = inject(UsersService);
  activeGroupService = inject(ActiveGroupService);
  activeRoute: string = '';

  ngOnInit(): void {
    this.activeRoute = this.normalizeRoute(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.activeRoute = this.normalizeRoute(event.urlAfterRedirects);
      });
  }

  private normalizeRoute(url: string): string {
    if (url.startsWith('/trips/')) {
      return '/trips';
    }

    return url.split('?')[0];
  }

  logout() {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.GROUP_DATA);
    this.activeGroupService.setGroups([]);
    this.router.navigate(['/login']);
    this.usersService.loggedIn.emit(false);
  }

  navigate(route: string) {
    this.activeRoute = route;
    this.router.navigate([route]);
  }
}
