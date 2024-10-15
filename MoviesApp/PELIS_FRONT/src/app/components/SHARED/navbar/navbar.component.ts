import { Component, inject } from '@angular/core';
import { MoviesService } from 'src/app/core/services/movies.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  movieService = inject(MoviesService);

  searchMovie(){
    this.movieService.searchMovie().subscribe({
      next: (res) => {
        console.log(res)
      },
      error: (err) => {
        console.log('Error' + err)
      }
    })
  }

}
