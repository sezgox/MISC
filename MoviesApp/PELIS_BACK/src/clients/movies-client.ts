import { Service } from "typedi";
import { GenresResponse, Movie, MoviesResponse } from "../interfaces/movies-response";


@Service()
export class MoviesApi{
    token: string = process.env.MOVIE_API_TOKEN ?? 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3ZjJkODc5YzIzYmFlZjdlMzUwMDcyNzA4ZGQ4NGVkZSIsInN1YiI6IjY2MzNhMzdlNDcwZWFkMDEyYTExMTEzOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.VYp11E9zvKx97cse0pik5MMJ5rj78Se_Ymvga0FSlhI';
    config = {
        method: 'GET',
        headers: {
        accept: 'application/json',
        Authorization: `Bearer ${this.token}`
        }
    }

    async getMovies(filters: any):Promise<MoviesResponse | undefined>{
        const url = 'https://api.themoviedb.org/3/discover/movie?include_adult=true&language=en-US'
        let query = '&';
        const page = filters.page;
        query = query.concat(`page=${page}`)
        const genre = filters.genre;
        if(genre){
            query = query.concat(`&with_genres=${genre}`);
        }
        const path = url.concat(query);
        try {
            const response = await fetch(path,this.config)
            const movies = await response.json();
            return movies
        } catch (error) {
            console.log(error)
            return undefined
        }
    }

    async getMovieById(id:number):Promise<Movie | undefined>{
        const url = 'https://api.themoviedb.org/3/movie/';
        const path = url.concat(`${id}`);
        try {
            const response = await fetch(path,this.config)
            const movie = await response.json();
            return movie
        } catch (error) {
            console.log(error)
            return undefined
        }
    }

    async getGenres():Promise<GenresResponse | undefined>{
        const url = 'https://api.themoviedb.org/3/genre/movie/list';
        try {
            const response = await fetch(url,this.config)
            const genres = await response.json();
            return genres
        } catch (error) {
            console.log(error)
            return undefined
        }
    }

}