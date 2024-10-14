import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Filter } from 'src/app/core/types/movies/filter-types';
import { GenresResponse } from 'src/app/core/types/movies/genres-types';
import { Movie } from 'src/app/core/types/movies/movies-types';
import { MovieListResponse, SimpleResponse } from '../types/back/my-response';

@Injectable({
  providedIn: 'root'
})
export class MoviesService {

  constructor(private http: HttpClient) { }

  url = 'http://localhost:3005/movies'

  getGenres():Observable<GenresResponse>{
    return this.http.get<GenresResponse>(`${this.url}/genres`);
  }

  getMovies(filter:Filter):Observable<Movie[]>{
    let query = '?';
    if(filter.genre !== 0){
      query = query.concat(`genre=${filter.genre}&`)
    }
    query = query.concat(`page=${filter.page}`)
    const path = this.url.concat(query);
    console.log(path)
    return this.http.get<Movie[]>(path)
  }

  getMovieById(id:number):Observable<Movie>{
    const path = this.url.concat(`/movie/${id}`);
    return this.http.get<Movie>(path);
  }

  addToWatched(mid:number,username:string):Observable<SimpleResponse>{
    const path = this.url.concat(`/watched/${username}`)
    return this.http.put<SimpleResponse>(path,{mid});
  }

  removeFromWatched(mid:number,username:string):Observable<SimpleResponse>{
    const path = this.url.concat(`/watched/${username}/${mid}`)
    return this.http.delete<SimpleResponse>(path);
  }

  getWatchedList(username:string):Observable<MovieListResponse<{mid:number}[]>>{
    const path = this.url.concat(`/watched/${username}`);
    return this.http.get<MovieListResponse<{mid:number}[]>>(path);
  }

}
