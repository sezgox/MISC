import { Request, Response } from "express";
import { MoviesService } from "../services/movies-service";


const moviesServices = new MoviesService();

export async function getWatchedList(req: Request, res: Response){
    const {username} = req.params;
    const moviesWatchedList = await moviesServices.getWatchedList(username);
    res.json(moviesWatchedList);
}

export async function addToWatchedList(req: Request, res: Response){
    const {mid,rate} = req.body;
    const {username} = req.params;
    const response = await moviesServices.addToWatchedList(username,mid,rate);
    res.json(response);
}

export async function removeFromWatchedList(req: Request, res: Response){
    const {username,mid} = req.params;
    const response = await moviesServices.removeFromWatchedList(username,Number(mid));
    res.json(response);
}

export async function getMovies(req:Request,res:Response){
    const {page,genre,sortBy} = req.query;
    const filters = {
        page,genre,sortBy
    }
    const response = await moviesServices.getMovies(filters);
    const movies = response ? response.results : {success:false,error:'Error connecting to api'}
    res.json(movies)
}

export async function getGenres(req:Request,res:Response){
    const genres = await moviesServices.getGenres();
    genres ? res.json(genres) : res.json({success:false, error: 'Error connecting to api'})
}

export async function getMovieById(req:Request,res:Response){
    const id = req.params.id
    const genres = await moviesServices.getMovieById(Number(id));
    genres ? res.json(genres) : res.json({success:false, error: 'Error connecting to api'})
}

export async function searchMovie(req: Request, res: Response){
    const {page,query} = req.query;
    const filter = {page,query};
    const response = await moviesServices.searchMovie(filter);
    res.json(response)
}










