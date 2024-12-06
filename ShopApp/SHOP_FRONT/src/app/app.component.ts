import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  router = inject(Router);

  ngOnInit(): void {
    const currentTime = Math.floor(Date.now() / 1000)
    const token = localStorage.getItem('AUTH_TOKEN');
    if(token && jwtDecode(token).exp < currentTime){
      this.router.navigate(["/login"]);
      localStorage.removeItem("AUTH_TOKEN");
      console.log('Token expired, sign in again to refresh your session')
    }
  }


}
