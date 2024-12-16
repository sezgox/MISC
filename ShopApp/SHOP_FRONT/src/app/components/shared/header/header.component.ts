import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UsersService } from '@services/users.service';
import { AccountType } from 'src/app/core/consts/user-role.enum';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  loggedIn: boolean = false;
  usersService = inject(UsersService);
  router = inject(Router)
  accountTypes = AccountType;
  role: string = '';

  @Output() signOut: EventEmitter<void> = new EventEmitter();

  ngOnInit(): void {
    const token = localStorage.getItem('AUTH_TOKEN');
    if(token){
      this.role = this.usersService.getCurrentUser().role;
      this.loggedIn = true;
    }
  }

  show: boolean = false;
  showMenu(){
    document.getElementById("menu")?.showPopover();
  }
  hideMenu(){
    document.getElementById("menu")?.hidePopover();
  }

  logout(){
    localStorage.removeItem("AUTH_TOKEN");
    this.loggedIn = false;
    this.signOut.emit();
  }

  goToHome(){
    this.router.navigate(['/']).then(() => {
      location.reload();
    });
  }

}
