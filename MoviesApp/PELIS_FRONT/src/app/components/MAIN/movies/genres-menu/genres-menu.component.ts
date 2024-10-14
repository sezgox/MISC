import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Genre } from 'src/app/core/types/movies/genres-types';
import { MoviesService } from '../../../../core/services/movies.service';

@Component({
  selector: 'app-genres-menu',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './genres-menu.component.html',
  styleUrl: './genres-menu.component.css'
})
export class GenresMenuComponent implements OnInit{

  moviesService = inject(MoviesService)

  @Output()
  genreSelected = new EventEmitter<Genre>();

  constructor(private router: Router){}

  genres: Genre[] = [];

  ngOnInit(): void {
    this.getGenres();
  }

  getGenres(){
    this.moviesService.getGenres().subscribe({
      next: (res) => {
        this.genres = res.genres;
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  filterByGenre(genre:Genre){
    this.genreSelected.emit(genre);
  }

}
