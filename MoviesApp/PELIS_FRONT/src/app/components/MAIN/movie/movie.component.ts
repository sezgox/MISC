import { Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Movie } from 'src/app/core/types/movies/movies-types';
import { MoviesService } from '../../../core/services/movies.service';

@Component({
  selector: 'app-movie',
  standalone: true,
  imports: [],
  templateUrl: './movie.component.html',
  styleUrl: './movie.component.css'
})
export class MovieComponent implements OnInit{

  moviesService = inject(MoviesService)
  movie: Movie = {
    adult: false,
    backdrop_path: '',
    genre_ids: [],
    id: 0,
    original_language: '',
    original_title: '',
    overview: '',
    popularity: 0,
    poster_path: '',
    release_date: '',
    title: '',
    video: false,
    vote_average: 0,
    vote_count: 0,
  };
  watched: boolean = false;
  urlParts = this.router.url.split('/');
  id: number = Number(this.urlParts[this.urlParts.length - 1]);

  constructor( private router: Router, private location: Location){}

  ngOnInit(): void {
    this.getMovieById();
  }

  getMovieById(){
    this.moviesService.getMovieById(this.id).subscribe({
      next: (res) => {
        this.movie = res;
        this.movieWatched();
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  addToWatched(){
    const token = localStorage.getItem('AUTH_TOKEN');
    if(!token){
      return
    }
    const decodedToken:any = jwtDecode(token);
    const username = decodedToken.username;

    this.moviesService.addToWatched(this.movie.id,username).subscribe({
      next: (res) => {
        if(res.success){
          this.watched = true;;
          console.log(res.data)
        }else{
          console.log(res.error)
        }
      }
    })
  }

  movieWatched(){
    const token = localStorage.getItem('AUTH_TOKEN');
    if(!token){
      return
    }
    const decodedToken: any = jwtDecode(token);
    const username = decodedToken.username;
    this.moviesService.getWatchedList(username).subscribe({
      next: (res) => {
        if(res.success){
          const movies = res.data;
          for(let movie of movies){
            if(Number(movie.mid) == this.movie.id){
              this.watched = true;
            }
          }
        }else{
          console.log(res.error)
        }
      }
    })
  }

  removeFromWatched(){
    const token = localStorage.getItem('AUTH_TOKEN');
    if(!token){
      return
    }
    const decodedToken:any = jwtDecode(token);
    const username = decodedToken.username;
    this.moviesService.removeFromWatched(this.movie.id,username).subscribe({
      next: (res) => {
        if(res.success){
          this.watched = false;;
          console.log(res.data)
        }else{
          console.log(res.error)
        }
      }
    })
  }

  goBack(){
    this.location.back();
  }

}
