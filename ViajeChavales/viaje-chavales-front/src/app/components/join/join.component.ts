import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { LOCAL_STORAGE_KEYS } from '../../core/consts/local-storage-key';
import { GroupInvitePreview } from '../../core/interfaces/group.interface';
import { ActiveGroupService } from '../../core/services/active-group.service';
import { GroupsService } from '../../core/services/groups.service';
import { UsersService } from '../../core/services/users.service';

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './join.component.html',
  styleUrl: './join.component.css',
})
export class JoinComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly groupsService = inject(GroupsService);
  private readonly usersService = inject(UsersService);
  private readonly activeGroupService = inject(ActiveGroupService);
  private readonly toastr = inject(ToastrService);

  groupId = '';
  preview: GroupInvitePreview | null = null;
  loading = true;
  joining = false;
  isLoggedIn = false;
  alreadyMember = false;

  async ngOnInit(): Promise<void> {
    this.route.queryParamMap.subscribe(async (params) => {
      this.groupId = params.get('group') ?? '';
      await this.loadState();
    });
  }

  get membersToShow() {
    return this.preview?.members?.slice(0, 12) ?? [];
  }

  get extraMembers(): number {
    const count = this.preview?.members?.length ?? 0;
    return Math.max(count - this.membersToShow.length, 0);
  }

  goToRegister() {
    this.router.navigate(['/register'], { queryParams: { group: this.groupId } });
  }

  goToLogin() {
    this.router.navigate(['/login'], { queryParams: { group: this.groupId } });
  }

  async joinWithCurrentUser() {
    if (!this.isLoggedIn || !this.groupId || this.joining || !this.preview) {
      return;
    }

    this.joining = true;
    try {
      await this.usersService.joinGroup(this.groupId);
      const groups = await this.usersService.getUserGroups();
      this.activeGroupService.setGroups(groups);
      await this.usersService.setActiveGroup(this.groupId);
      this.activeGroupService.setActiveGroupById(this.groupId, true);
      this.toastr.success('Te has unido al grupo');
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo unir al grupo');
    } finally {
      this.joining = false;
    }
  }

  private async loadState() {
    this.loading = true;
    this.preview = null;
    this.alreadyMember = false;
    this.isLoggedIn = this.hasValidToken();

    if (!this.groupId) {
      this.loading = false;
      return;
    }

    try {
      this.preview = await this.groupsService.getGroupInvitePreview(this.groupId);
      if (!this.preview) {
        this.loading = false;
        return;
      }

      if (this.isLoggedIn) {
        const groups = await this.usersService.getUserGroups();
        this.activeGroupService.setGroups(groups);
        this.alreadyMember = groups.some((group) => group.groupId === this.groupId);
      }
    } catch {
      this.preview = null;
    } finally {
      this.loading = false;
    }
  }

  private hasValidToken(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS);
    if (!token) {
      return false;
    }

    try {
      const payload = jwtDecode<JwtPayload>(token);
      return !!payload.exp && payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}
