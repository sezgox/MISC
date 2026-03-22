import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatComponent } from './components/shared/chat/chat.component';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { LOCAL_STORAGE_KEYS } from './core/consts/local-storage-key';
import { ActiveGroupService } from './core/services/active-group.service';
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
  activeGroupService = inject(ActiveGroupService);
  loggedIn: boolean = false;
  private subscription: Subscription | null = null;

  title = 'ViajeChavales';

  ngOnInit(): void {
    this.initializeSession();

    this.subscription = this.usersService.loggedIn.subscribe(data => {
      this.loggedIn = data;
      if (data) {
        this.loadGroups();
      }
    });
  }

  private initializeSession() {
    if (typeof window === 'undefined') {
      return;
    }

    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS);
    if (token) {
      this.loggedIn = true;
      this.usersService.loggedIn.emit(true);
      this.loadGroups();
    }
  }

  private async loadGroups() {
    try {
      const groups = await this.usersService.getUserGroups();
      this.activeGroupService.setGroups(groups);
    } catch {
      // Skip group sync on login errors; the route guards and API calls will handle auth state.
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
