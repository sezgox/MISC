import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-invite',
  standalone: true,
  imports: [],
  templateUrl: './invite.component.html',
  styleUrl: './invite.component.css'
})
export class InviteComponent implements OnInit {

  uservice = inject(UsersService);
  toastr = inject(ToastrService);
  platformId = inject(PLATFORM_ID);
  groupId: string = '';
  url: string = '';

  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const user = await this.uservice.getUser(localStorage.getItem('USER_DATA') ?? '');
    this.groupId = user.groupId;
    this.url = window.location.origin;
  }

  copyLink(){
    if (!isPlatformBrowser(this.platformId) || !this.groupId) {
      return;
    }

    navigator.clipboard.writeText(`${this.url}/register?group=${this.groupId}`).then(data => {
      this.toastr.clear();
      this.toastr.info('Enlace copiado en el portapapeles');
    }).catch(err => {
      this.toastr.error('Inténtalo de nuevo más tarde','Hubo un error al copiar el enlace');
    });
  }


}
