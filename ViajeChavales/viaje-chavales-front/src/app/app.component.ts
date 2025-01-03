import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UsersService } from './core/services/users.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  title = 'ViajeChavales';

  usersService = inject(UsersService);

  ngOnInit(): void {
    this.usersService.updateUsers().subscribe({
      next: (res) => {
      }
    });
  }

}
