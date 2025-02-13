import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { UsersService } from '@services/users.service';
import { localStorageKeys } from 'src/app/core/consts/local-storage';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, MatIcon, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  ngOnInit(): void {
    const user = this.usersService.getCurrentUser();
    console.log(user)
    if(user){
      this.email.setValue(user.email);
      this.userExists();
    }
  }

  usersService = inject(UsersService);
  authService = inject(AuthService);
  router = inject(Router);

  emailValid: boolean = false;
  userNotExists: boolean;
  emailIsEmpty: boolean;

  name: string = '';

  email: FormControl = new FormControl('');
  password: FormControl = new FormControl('');


  goBack(){
    this.usersService.clearCurrentUser();
    this.email.reset();
    this.emailValid = false;
  }

  userExists(){
    if(!this.email.value){
      this.emailIsEmpty = true;
      return
    }
    this.usersService.userExists(this.email.value).subscribe({
      next: (res) => {
        console.log(res)
        this.emailValid = true;
        this.name = res.role == "PERSONAL" ? `${res.firstName} ${res.lastName}` :res.businessName;
      },
      error: (err) => {
        this.userNotExists = true;
        console.log(err)
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
      next: (res) => {
          localStorage.setItem(localStorageKeys.AUTH_TOKEN,res.jwt);
          this.usersService.setCurrentUser(res.userData);
          this.router.navigate(['products']);
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

}
