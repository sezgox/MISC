import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit{

  year: number = 2024;

  ngOnInit(): void {
    const date = new Date();
    this.year = date.getFullYear()
  }

  correo: string = 'juanmateoc11@gmail.com';
  



}
