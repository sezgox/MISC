import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LOCAL_STORAGE_ACCESS_KEY } from '../../core/consts/local-storage-key';
import { UserCredentials } from '../../core/interfaces/user.interface';
import { UsersService } from './../../core/services/users.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  user: UserCredentials = {
    username: '',
    password: ''
  };

  usersService = inject(UsersService);
  toastr = inject(ToastrService);
  router = inject(Router);

  login(){
    this.usersService.loginUser(this.user).subscribe({
      next: (res) => {
        localStorage.setItem(LOCAL_STORAGE_ACCESS_KEY, res.access_token);
        this.toastr.success(`Bienvenido ${this.user.username}`);
        this.router.navigate(['/home'])
        console.log(res);
      },
      error: (err) => {
        this.toastr.error('Usuario o contraseña incorrectos');
        console.error(err);
      }
    })
  }

}
