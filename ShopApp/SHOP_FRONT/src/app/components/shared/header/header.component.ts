import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  loggedIn: boolean = false;

  @Output() signOut: EventEmitter<void> = new EventEmitter();

  ngOnInit(): void {
    const token = localStorage.getItem('AUTH_TOKEN');
    if(token){
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

}
