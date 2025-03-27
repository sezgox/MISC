import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatComponent } from './components/shared/chat/chat.component';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { UsersService } from './core/services/users.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatComponent, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy{

  usersService = inject(UsersService);
  loggedIn: boolean = false;
  private subscription: Subscription | null = null;

  title = 'ViajeChavales';

  ngOnInit(): void {
    this.subscription = this.usersService.loggedIn.subscribe(data => {
      this.loggedIn = data;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
