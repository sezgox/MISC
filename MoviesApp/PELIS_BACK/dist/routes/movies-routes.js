"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routerMovies = void 0;
const express_1 = require("express");
const movies_controller_1 = require("../controllers/movies-controller");
class routerMovies {
    constructor() {
        this.path = '/movies';
        this.router = (0, express_1.Router)();
        this.initRoutes();
    }
    initRoutes() {
        this.router.get(`${this.path}`, movies_controller_1.getMovies);
        this.router.get(`${this.path}/search`, movies_controller_1.searchMovie);
        this.router.get(`${this.path}/movie/:id`, movies_controller_1.getMovieById);
        this.router.get(`${this.path}/genres`, movies_controller_1.getGenres);
        this.router.get(`${this.path}/watched/:username`, movies_controller_1.getWatchedList);
        this.router.put(`${this.path}/watched/:username`, movies_controller_1.addToWatchedList);
        this.router.delete(`${this.path}/watched/:username/:mid`, movies_controller_1.removeFromWatchedList);
    }
}
exports.routerMovies = routerMovies;
