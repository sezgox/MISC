import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { UsersService } from '../services/users.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, MatIcon, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  ngOnInit(): void {
    const token = localStorage.getItem('AUTH_TOKEN')
    if(token){
      this.email.setValue('decodear_token_sacar_email')
      this.emailValid = true
    }
  }

  usersService = inject(UsersService);
  authService = inject(AuthService);

  emailValid: boolean = false;
  userNotExists: boolean;
  emailIsEmpty: boolean;

  email: FormControl = new FormControl('');
  password: FormControl = new FormControl('');

  goBack(){
    this.email.reset();
    this.emailValid = false;
  }

  userExists(){
    if(!this.email.value){
      this.emailIsEmpty = true;
      return
    }
    this.usersService.userExists(this.email.value).subscribe({
      next: (res: any) => {
        if(res.status == 404){
          this.userNotExists = true;
        }else{
          this.emailValid = true;
        }
      }
    })
  }

  onInputEmail(){
    if(this.userNotExists){
      this.userNotExists = false;
    }
    if(this.emailIsEmpty){
      this.emailIsEmpty = false;
    }
  }

  signIn(){
    if(!this.email.value || !this.password.value){
      return
    }
    this.authService.signIn({email:this.email.value,password:this.password.value}).subscribe({
      next: (res: any) => {
        if(res.status == 401){
          console.log('Incorrect password')
        }else{
          localStorage.setItem('AUTH_TOKEN',res.jwt)
          console.log('User registered')
        }
      }
    })
  }

}
