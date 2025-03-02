import { Component, inject, OnInit } from '@angular/core';
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
  groupId: string = '';
  url: string = window.location.origin;

  async ngOnInit(): Promise<void> {
    const user = await this.uservice.getUser(localStorage.getItem('USER_DATA') ?? '');
    this.groupId = user.groupId;
  }

  copyLink(){
    navigator.clipboard.writeText(`${this.url}/register?group=${this.groupId}`).then(data => {
      this.toastr.clear();
      this.toastr.info('Enlace copiado en el portapapeles');
    }).catch(err => {
      this.toastr.error('Inténtalo de nuevo más tarde','Hubo un error al copiar el enlace');
    });
  }


}
