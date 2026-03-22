import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActiveGroupService } from '../../../core/services/active-group.service';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-invite',
  standalone: true,
  imports: [],
  templateUrl: './invite.component.html',
  styleUrl: './invite.component.css'
})
export class InviteComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly activeGroupService = inject(ActiveGroupService);
  private readonly toastr = inject(ToastrService);
  private readonly platformId = inject(PLATFORM_ID);

  url = '';

  get groupId(): string {
    return this.activeGroupService.getActiveGroupId() ?? '';
  }

  get groupName(): string {
    return this.activeGroupService.getActiveGroupName();
  }

  get canUseNativeShare(): boolean {
    if (!isPlatformBrowser(this.platformId) || !this.groupId) {
      return false;
    }

    const navigatorShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
    return navigatorShare && this.isMobileDevice;
  }

  get isMobileDevice(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    return window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 768;
  }

  get buttonLabel(): string {
    return this.isMobileDevice ? 'Compartir invitacion' : 'Copiar invitacion';
  }

  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.url = window.location.origin;

    if (!this.groupId) {
      const groups = await this.usersService.getUserGroups();
      this.activeGroupService.setGroups(groups);
    }
  }

  private getInviteLink() {
    return `${this.url}/register?group=${this.groupId}`;
  }

  async shareLink() {
    if (!isPlatformBrowser(this.platformId) || !this.groupId) {
      return;
    }

    const link = this.getInviteLink();

    if (this.isMobileDevice && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `Invitacion a ${this.groupName || this.groupId}`,
          text: `Unete a mi grupo en ViajeChavales`,
          url: link,
        });
      } catch {
        // Cancelled share action should not show an error toast.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      this.toastr.clear();
      this.toastr.info('Enlace copiado en el portapapeles');
    } catch {
      this.toastr.error('Intentalo de nuevo mas tarde', 'Hubo un error al copiar el enlace');
    }
  }
}
