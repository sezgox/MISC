"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routerMovies = void 0;
const express_1 = require("express");
const movies_1 = require("../controllers/movies");
class routerMovies {
    constructor() {
        this.path = '/movies';
        this.router = (0, express_1.Router)();
        this.initRoutes();
    }
    initRoutes() {
        this.router.get(`${this.path}`, movies_1.getMovies);
        this.router.get(`${this.path}/movie/:id`, movies_1.getMovieById);
        this.router.get(`${this.path}/genres`, movies_1.getGenres);
        this.router.get(`${this.path}/watched/:username`, movies_1.getWatchedList);
        this.router.put(`${this.path}/watched/:username`, movies_1.addToWatchedList);
        this.router.delete(`${this.path}/watched/:username/:mid`, movies_1.removeFromWatchedList);
    }
}
exports.routerMovies = routerMovies;
