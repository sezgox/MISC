import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink,FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  constructor(private router: Router){}

  authService = inject(AuthService);
  username = '';
  password = '';
  confirm = '';
  register(){
      this.authService.register({username: this.username, password: this.password}).subscribe({
        next: (res) => {
          console.log(res)
          if(res.success){
            const user = res.data;
            console.log(`User ${user.username} created`);
            this.router.navigate(['/login'])
          }else{
            console.log(res.error)
          }
        },error: (err) => {
          console.log(err)
        }
      })
  }

  validForm(){
    let userInvalid: boolean = false;
    let passInvalid: boolean = false;
    let confirmInvalid: boolean = false;
    if(this.username.length < 5){
      userInvalid = true;
      console.log('Username must have at least 5 characters')
    }if(this.password.length < 8){
      passInvalid = true;
      console.log('Password must be at least 8 characters long')
    }if(this.password !== this.confirm){
      confirmInvalid = true;
      console.log('Passwords must match!')
    }

    if(!userInvalid && !passInvalid && !confirmInvalid){
      this.register();
    }

    this.username = '';
    this.password = '';
    this.confirm = '';
  }

}
