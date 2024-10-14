"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMovieById = exports.getGenres = exports.getMovies = exports.removeFromWatchedList = exports.addToWatchedList = exports.getWatchedList = void 0;
const movies_service_1 = require("../services/movies-service");
const moviesServices = new movies_service_1.MoviesService();
function getWatchedList(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { username } = req.params;
        const moviesWatchedList = yield moviesServices.getWatchedList(username);
        res.json(moviesWatchedList);
    });
}
exports.getWatchedList = getWatchedList;
function addToWatchedList(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { mid, rate } = req.body;
        const { username } = req.params;
        const response = yield moviesServices.addToWatchedList(username, mid, rate);
        res.json(response);
    });
}
exports.addToWatchedList = addToWatchedList;
function removeFromWatchedList(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { username, mid } = req.params;
        const response = yield moviesServices.removeFromWatchedList(username, Number(mid));
        res.json(response);
    });
}
exports.removeFromWatchedList = removeFromWatchedList;
function getMovies(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { page, genre, sortBy } = req.query;
        const filters = {
            page, genre, sortBy
        };
        const response = yield moviesServices.getMovies(filters);
        const movies = response ? response.results : { success: false, error: 'Error connecting to api' };
        res.json(movies);
    });
}
exports.getMovies = getMovies;
function getGenres(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const genres = yield moviesServices.getGenres();
        genres ? res.json(genres) : res.json({ success: false, error: 'Error connecting to api' });
    });
}
exports.getGenres = getGenres;
function getMovieById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = req.params.id;
        const genres = yield moviesServices.getMovieById(Number(id));
        genres ? res.json(genres) : res.json({ success: false, error: 'Error connecting to api' });
    });
}
exports.getMovieById = getMovieById;
