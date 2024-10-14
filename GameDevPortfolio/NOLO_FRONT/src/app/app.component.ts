import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './public/footer/footer.component';
import { NavbarComponent } from './public/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  hasVisited: boolean = false;
  ngOnInit(): void {
    this.hasVisited = localStorage.getItem('START') == 'DONE' ? true : false;
  }
  scrollTo(id:any){
    const section = document.getElementById(id);
    if(section){
      const offsetTop = section.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  }
}
