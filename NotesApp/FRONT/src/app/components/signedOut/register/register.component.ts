import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
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
export class RegisterComponent implements OnInit{

  constructor(private usersService: UsersService, private router: Router, private toastr: ToastrService) { }

  loading: boolean = false;
  userCreated: boolean = false;

  invalid = {
    username: true,
    password: true,
    confirmPassword: true,
    register:  false
  }
  disableButton: boolean = true;
  helperMsg = {
    username: '',
    password: '',
    confirmPassword: '',
    register: ''
  };

  usernameInUse: boolean;

  username = new FormControl('', [Validators.required]);
  password = new FormControl('', [Validators.required]);
  confirmPassword = new FormControl('', [Validators.required]);

  regForm = new FormGroup({
    username: this.username,
    password: this.password,
    confirmPassword: this.confirmPassword
  });

  ngOnInit():void{
    this.checkUsername();
    this.checkPasswords();
  }

  async submit() {
    if (this.invalid.confirmPassword || this.invalid.password || this.invalid.username) {
      //FAKE TOASTR 
      this.invalid.register = true;
      this.helperMsg.register = 'You must fill up all the fields correctly';
      setTimeout(() => {
        this.invalid.register = false
      },1000)
    } else {
      const user = {
        username: this.username.value,
        password: this.password.value
      }
      const result = await this.usersService.register(user)
      if(result != false){
          this.toastr.show('User created :)');
          this.router.navigate(['/login'])
          return
      }
      //FAKE TOASTR
      this.helperMsg.register = 'User not created :(';
      this.invalid.register = true;
      setTimeout(() => {
        this.invalid.register = false
      },1000)
    }
  }

  checkPasswords() {
    if (this.regForm.value.password.length < 8) {
      this.invalid.password = true;
      this.helperMsg.password = "Password must be at least 8 characters"
    } else {
      this.invalid.password = false;
      this.helperMsg.confirmPassword = "Password valid";
    }
    if (this.regForm.value.password == this.regForm.value.confirmPassword) {
      this.invalid.confirmPassword = false;
      this.helperMsg.confirmPassword = "Passwords matches";
    } else {
      this.invalid.confirmPassword = true;
      this.helperMsg.confirmPassword = "Passwords must match";
    }
  }


  async checkUsername() {
    this.loading = true;
    if (this.regForm.value.username.length < 5) {
      this.helperMsg.username = 'Username must have at least 5 characters'
      this.invalid.username = true;
    } else {
      const username = this.regForm.value.username;
      const exists = await this.usersService.checkUsername(username);
      if (exists) {
        this.helperMsg.username = 'Username already in use';
        this.invalid.username = true;
      } else {
        this.helperMsg.username = 'Username available';
        this.invalid.username = false;
      }
    }
    setTimeout(()=>{
      this.loading = false;
    },200);
  }

}
