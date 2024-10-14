import { Router } from "express";
import { addToWatchedList, getGenres, getMovieById, getMovies, getWatchedList, removeFromWatchedList } from "../controllers/movies-controller";
import { Routes } from "../interfaces/routes-interface";

export class routerMovies implements Routes{

    path: string = '/movies';
    router: Router = Router();

    constructor(){
        this.initRoutes();
    }

    initRoutes(){
        this.router.get(`${this.path}`,getMovies)
        this.router.get(`${this.path}/movie/:id`,getMovieById)
        this.router.get(`${this.path}/genres`,getGenres)
        this.router.get(`${this.path}/watched/:username`,getWatchedList)
        this.router.put(`${this.path}/watched/:username`,addToWatchedList)
        this.router.delete(`${this.path}/watched/:username/:mid`,removeFromWatchedList)
    }
}
