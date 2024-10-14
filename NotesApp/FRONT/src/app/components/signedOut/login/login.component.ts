import { animate, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuService } from 'src/app/services/menu.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger(
      'inOutAnimation', //NAME
      [
        transition(
          ':enter', //WHEN DIV IS BEING ADDED BY ngIf
          [
            style({ opacity: 0 }),
            animate('0.2s ease-out', 
                    style({ opacity: 1}))
          ]
        ),
        transition(
          ':leave', //WHEN DIV IS BEING REMOVED BY ngIf
          [
            style({ opacity: 1}),
            animate('0.2s ease-in', 
                    style({ opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class LoginComponent {

  showUpMsg: Boolean = false;
  msg: String = '';

  username = new FormControl('',[Validators.required]);
  password = new FormControl('',[Validators.required]);
  logForm = new FormGroup({
    username: this.username,
    password: this.password,
  });

  constructor(private usersService: UsersService, private router: Router, private menuService: MenuService){
  }


  ngOnInit(){
  }

  async submit(){
    if (this.logForm.valid){
      const user = {
        username: this.username.value,
        password: this.password.value
      }
      const result = await this.usersService.login(user);
      if(result == false){
        this.showUpMsg = true;
        this.msg = 'Usurname or password invalid';
        setTimeout(()=>{
          this.showUpMsg = false;
        },1000)
        this.logForm.reset();
        return
      }
      const token = result;
      localStorage.setItem('AUTH_TOKEN',token);
      this.router.navigate(['/feed']);
      this.menuService.showNav();
      this.menuService.isDesktop();
    }else{
      this.showUpMsg = true;
      this.msg = 'Enter your username and password';
      setTimeout(()=>{
        this.showUpMsg = false;
      },1000)
    }
  }

}
