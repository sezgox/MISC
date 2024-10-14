import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Movie } from 'src/app/core/types/movies/movies-types';

@Component({
  selector: 'app-movie-library',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './movie-library.component.html',
  styleUrl: './movie-library.component.css'
})
export class MovieLibraryComponent implements OnInit{

  @Input()
  movies: Movie[] = [];

  ngOnInit(): void {
    
  }


}
