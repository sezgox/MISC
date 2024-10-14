import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  ngOnInit(): void {
    if(localStorage.getItem('AUTH_TOKEN')){
      this.router.navigate(['/admin/backoffice']);
    }
  }

  authService = inject(AuthService);
  router = inject(Router)

  username: string = '';
  password: string = '';

  validForm(){
    if(!this.username || !this.password){
      console.log('Rellena todos los campos!')
    }else{
      this.login();
    }
  }

  login(){
    this.authService.login(this.username,this.password).subscribe({
      next:(result) => {
        if(result.success){
          localStorage.setItem('AUTH_TOKEN',result.data);
          this.router.navigate(['/admin/backoffice']);
        }else{
          console.log(result.data);
        }
      }
    })
  }

}
