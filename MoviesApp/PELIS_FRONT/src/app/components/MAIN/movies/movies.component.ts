import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DiscoverFilters } from 'src/app/core/types/movies/filter-types';
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
  route = inject(ActivatedRoute);
  page: number = 1;
  totalPages: number = 499;
  genres: Genre[] = [];
  genre: Genre = {
    id: 0,
    name: 'all'
  }
  movies: Movie[] = [];
  search: string = '';
  section = this.urlParts[this.urlParts.length - 3];
  searching: boolean = this.section == 'search';

  constructor(private router: Router){
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.page =  Number(params.get('page'));
      if(this.section == 'discover'){
        const genre =  params.get('genre')
        this.genre.name = genre ? genre : 'all';
        this.getGenres();
      }else{
        const search = params.get('title');
        this.search = search ? search : '';
        this.searchMovie(this.search)
      }
    });
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
    
  getMovies(filter: DiscoverFilters){
    this.moviesService.getMovies(filter).subscribe({
      next: (res) => {
        this.movies = res.results;
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  nextPage(){
    this.page++;
    if(!this.searching){
      this.router.navigate([`/movies/discover/${this.genre.name}/${this.page}`])
      this.getMovies({page:this.page,genre:this.genre.id})
    }else{
      this.searchMovie(this.search);
      this.router.navigate([`/movies/search/${this.search}/${this.page}`])
    }
  }
  previousPage(){
    this.page--;
    if(!this.searching){
      this.router.navigate([`/movies/discover/${this.genre.name}/${this.page}`])
      this.getMovies({page:this.page,genre:this.genre.id})
    }else{
      this.searchMovie(this.search);
      this.router.navigate([`/movies/search/${this.search}/${this.page}`])
    }
  }

  filterByGenre(genre: Genre){
    this.genre = genre;
    this.page = 1;
    this.getMovies({page:this.page,genre:this.genre.id})
  }

  searchMovie(search: string){
    const filter = {
      query: search,
      page: this.page
    }
    this.moviesService.searchMovie(filter).subscribe({
      next: (res) => {
        this.movies = res.results;
        this.totalPages = res.total_pages;
      }
    });
  }


}
