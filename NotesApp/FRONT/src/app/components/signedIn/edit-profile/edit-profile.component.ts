import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent {

  constructor(private usersService: UsersService,private route: ActivatedRoute, private toastr: ToastrService, private router: Router){}

  currentDescription: string;
  currentUsername: string;
  username: string;
  description: string = '';
  password: string = '';
  confirmPass: string = '';
  loading: boolean;
  invalid = {
    username: false,
    password: false,
    confirm: false
  }

  ngOnInit():void{
    this.route.params.subscribe({
      next: (params) => {
        const user = params['user'];
        this.currentUsername = user;
        this.username = this.currentUsername;
        this.getProfile(this.currentUsername)
      }
    });
  }

  submit(){
    const newUsername = this.username == this.currentUsername ? null : this.username;
    const newDescription = this.description == this.currentDescription ? null : this.description;
    const newPassword = this.password ? this.password : null;
    /* if(newUsername == null && newDescription == null && this.description == null) return */
    const newInfo = {
      newUsername: newUsername,
      newDescription: newDescription,
      newPassword: newPassword
    }
    this.updateProfile(newInfo);
  }

  async updateProfile(newInfo){
    const result = await this.usersService.updateProfile(this.currentUsername,newInfo);
    if(result === false){
      this.toastr.show('Error al actualizar información de usuario')
    }else if(result === true){
      this.router.navigate([`/profile/${this.username}`])
      this.toastr.show('Profile updated :)')
    }else{
      const token = result;
      localStorage.setItem('AUTH_TOKEN',token);
      const decodedToken: any = jwtDecode(token);
      const username = decodedToken.username;
      this.router.navigate([`/profile/${username}`])
      this.toastr.show('Profile updated :)')
    }
  }

  async checkUsername() {
    this.loading = true;
    if (this.username.length < 5) {
      this.invalid.username = true;
    } else {
      const username = this.username;
      const exists = await this.usersService.checkUsername(username);
      if (!exists || this.username == this.currentUsername ) {
        this.invalid.username = false;
      } else {
        this.invalid.username = true;
      }
    }
    setTimeout(()=>{
      this.loading = false;
    },300);
  }

  checkPasswords(){
    this.invalid.password = this.password.length < 8;
    this.invalid.confirm = this.password !== this.confirmPass;
  }

  async getProfile(username){
    const result = await this.usersService.getProfileToEdit(username);
    if(result == false){
      this.toastr.show('Sorry, unable to edit profile :(')
      this.router.navigate([`/profile${this.username}`])
    }else{
      const profileInfo = result;
      this.currentDescription = profileInfo.description;
      this.description = this.currentDescription;
    }
  }

}
