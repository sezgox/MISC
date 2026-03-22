import { NgClass } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs';
import { LOCAL_STORAGE_KEYS } from '../../../core/consts/local-storage-key';
import { ActiveGroupService } from '../../../core/services/active-group.service';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  router = inject(Router);
  usersService = inject(UsersService);
  activeGroupService = inject(ActiveGroupService);
  toastr = inject(ToastrService);
  activeRoute: string = '';
  selectedGroupId: string = '';

  ngOnInit(): void {
    this.activeRoute = this.normalizeRoute(this.router.url);
    this.loadGroups();

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.activeRoute = this.normalizeRoute(event.urlAfterRedirects);
      });

    this.activeGroupService.changed$.subscribe((groupId) => {
      this.selectedGroupId = groupId;
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

  async changeGroup() {
    if (!this.selectedGroupId || this.selectedGroupId === this.activeGroupService.getActiveGroupId()) {
      return;
    }

    try {
      await this.usersService.setActiveGroup(this.selectedGroupId);
      this.activeGroupService.setActiveGroupById(this.selectedGroupId, true);
      this.toastr.success('Grupo activo actualizado');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo cambiar de grupo');
      this.selectedGroupId = this.activeGroupService.getActiveGroupId() ?? '';
    }
  }

  private async loadGroups() {
    try {
      const groups = await this.usersService.getUserGroups();
      this.activeGroupService.setGroups(groups);
      this.selectedGroupId = this.activeGroupService.getActiveGroupId() ?? '';
    } catch {
      this.selectedGroupId = '';
    }
  }
}
