import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MoviesService } from 'src/app/core/services/movies.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  movieService = inject(MoviesService);
  router = inject(Router);

  search: string = '';

  @Output() searchEvent = new EventEmitter<string>();
  @Input() page?: number;

  searchMovie(){
    this.searchEvent.emit(this.search)
    this.router.navigate([`/movies/search/${this.search}/1`]);
  }

}
