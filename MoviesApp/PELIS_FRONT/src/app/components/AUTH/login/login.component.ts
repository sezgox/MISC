import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink,FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(private router: Router){}

  authService = inject(AuthService);

  username: string = '';
  password: string = '';

  login(){
    this.authService.login({username:this.username,password:this.password}).subscribe({
      next: (res) => {
        if(res.success){
          const token = res.data;
          localStorage.setItem('AUTH_TOKEN',token);
          this.router.navigate(['/movies'])
          console.log('User logged')
        }else{
          console.log(res.error)
        }
      }
    })
  }

  validForm(){
    if(!this.username || !this.password){
      console.log('Fill up all the fields!')
    }
    this.login()
    this.username = '';
    this.password = '';
  }

}
