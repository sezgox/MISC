import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GroupsService } from '../../core/services/groups.service';
import { UsersService } from '../../core/services/users.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  route = inject(ActivatedRoute);
  router = inject(Router);
  groupsService = inject(GroupsService);
  usersService = inject(UsersService);
  toastr = inject(ToastrService)

  create: WritableSignal<boolean> = signal(true);
  groupId: string = '';
  groupName: string = '';

  password: string = '';
  confirm: string = '';
  username: string = '';


  ngOnInit(): void {
    this.route.queryParamMap.subscribe({
      next: async params => {
        this.groupId = params.get('group') ?? '';
        if(this.groupId){
          const group = await this.groupsService.getGroupById(this.groupId);
          if(group){
            this.groupName = group.name;
            this.create.set(false);
          }else{
            this.router.navigate(['register']);
          }
          return;
        }
      }
    });
  }

  async register(){
    const user = {
      username: this.username,
      password: this.password,
      groupId: this.groupId,
      profilePicture:'https://photosrush.com/wp-content/uploads/aesthetic-instagram-pfp-ideas-2.jpg'
    }
    if(!this.validForm()){
      return;
    }
    if(this.groupId == ''){
      const group = await this.groupsService.createGroup(this.groupName)
      user.groupId = group.id;
    }
    this.usersService.registerUser(user).subscribe({
      next: (res) => {
        this.toastr.success('Inicia sesión ahora', 'Usuario creado')
        this.router.navigate(["/login"]);
      },
      error: (err) => {
        this.toastr.error(err.error.message,'Error al crear el usuario')
      }
    })
  }

  validForm(): boolean{
    if(this.password !== this.confirm){
      this.toastr.error('Passwords do not match');
      return false;
    }
    if(this.password.length < 8){
      this.toastr.error('Password must be at least 8 characters');
      return false;
    }
    if(this.username.length < 5){
      this.toastr.error('Username must be at least 5 characters');
      return false;
    }
    if(this.groupId == '' && this.groupName.length < 3){
      this.toastr.error("Group name must be at least 3 characters");
      return false;
    }
    return true;
  }

}
