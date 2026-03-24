import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LOCAL_STORAGE_KEYS } from '../../core/consts/local-storage-key';
import { UserCredentials } from '../../core/interfaces/user.interface';
import { ActiveGroupService } from '../../core/services/active-group.service';
import { UsersService } from '../../core/services/users.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, MatFormFieldModule, MatInputModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly usersService = inject(UsersService);
  private readonly activeGroupService = inject(ActiveGroupService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  user: UserCredentials = {
    username: '',
    password: '',
  };

  invitedGroupId = '';

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.invitedGroupId = params.get('group') ?? '';
    });
  }

  login() {
    this.usersService.loginUser(this.user).subscribe({
      next: async (res) => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS, res.access_token);
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER_DATA, this.user.username);
        this.usersService.loggedIn.emit(true);

        try {
          if (this.invitedGroupId) {
            await this.usersService.joinGroup(this.invitedGroupId);
            await this.usersService.setActiveGroup(this.invitedGroupId);
          }

          const groups = await this.usersService.getUserGroups();
          this.activeGroupService.setGroups(groups);

          if (this.invitedGroupId) {
            this.activeGroupService.setActiveGroupById(this.invitedGroupId, true);
            this.toastr.success('Sesión iniciada y grupo vinculado');
          } else {
            this.toastr.success(`Bienvenido ${this.user.username}`);
          }

          this.router.navigate(['/home']);
        } catch (error: any) {
          this.toastr.warning(error?.error?.message ?? 'Sesión iniciada, pero no se pudo vincular el grupo');
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        this.toastr.error('Usuario o contraseña incorrectos');
        console.error(err);
      },
    });
  }
}
