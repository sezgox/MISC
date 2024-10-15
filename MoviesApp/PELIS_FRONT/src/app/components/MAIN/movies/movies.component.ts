import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Filter } from 'src/app/core/types/movies/filter-types';
import { Genre } from 'src/app/core/types/movies/genres-types';
import { Movie } from 'src/app/core/types/movies/movies-types';
import { MoviesService } from '../../../core/services/movies.service';
import { NavbarComponent } from '../../SHARED/navbar/navbar.component';
import { GenresMenuComponent } from './genres-menu/genres-menu.component';
import { MovieLibraryComponent } from './movie-library/movie-library.component';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [RouterLink,GenresMenuComponent,MovieLibraryComponent, NavbarComponent],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.css'
})
export class MoviesComponent implements OnInit{

  //TODO:SORTY BY RELEASE_YEAR, POPULARITY(DEFAULT) --> AGREGAR A TIPO FILTRO PROPIEDAD sortBy

  moviesService = inject(MoviesService);
  urlParts = this.router.url.split('/');
  page: number;
  genres: Genre[] = [];
  genre: Genre = {
    id: 0,
    name: 'all'
  }
  movies: Movie[] = [];

  constructor(private router: Router){
    const page =  Number(this.urlParts[this.urlParts.length - 1]);
    if(page >= 1 && page< 500){
      this.page = page
    }else{
      this.page = 1;
      this.router.navigate([`/movies/discover/${this.genre.name}/${this.page}`]);
    }
  }

  ngOnInit(): void {
    this.getGenres();
  }

  getGenres(){
    this.moviesService.getGenres().subscribe({
      next: (res) => {
        this.genres = res.genres;
        const genre = this.genres.find(genre => genre.name == this.urlParts[this.urlParts.length - 2]);
        if(genre){
          this.genre = genre
        }
        this.getMovies({page: this.page,genre: this.genre.id});
      },
      error: (err) => {
        console.log(err);
      }
    })
  }
    
  getMovies(filter: Filter){
    this.moviesService.getMovies(filter).subscribe({
      next: (res) => {
        this.movies = [];
        for(let movie of res){
          this.movies.push(movie);
        }
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  nextPage(){
    this.page++;
    this.router.navigate([`/movies/discover/${this.genre.name}/${this.page}`])
    this.getMovies({page:this.page,genre:this.genre.id})
  }
  previousPage(){
    this.page--;
    this.router.navigate([`/movies/discover/${this.genre.name}/${this.page}`])
    this.getMovies({page:this.page,genre:this.genre.id})
  }

  filterByGenre(genre: Genre){
    this.genre = genre;
    this.page = 1;
    this.getMovies({page:this.page,genre:this.genre.id})
  }


}
