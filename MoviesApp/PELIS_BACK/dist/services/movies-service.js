"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoviesService = void 0;
const typedi_1 = require("typedi");
const movies_client_1 = require("../clients/movies-client");
const Watched_1 = require("../models/Watched");
const users_service_1 = require("./users-service");
let MoviesService = (() => {
    let _classDecorators = [(0, typedi_1.Service)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MoviesService = _classThis = class {
        constructor() {
            this.moviesApi = new movies_client_1.MoviesApi();
        }
        getMovies(filter) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.moviesApi.getMovies(filter);
            });
        }
        getGenres() {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.moviesApi.getGenres();
            });
        }
        getMovieById(id) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.moviesApi.getMovieById(id);
            });
        }
        movieOnList(uid, mid) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const movie = yield Watched_1.Watched.findOne({ where: { uid: uid, mid: mid } });
                    if (movie) {
                        const data = movie.dataValues;
                        return { success: true, data: data };
                    }
                    return { success: false, error: 'Movie is not on the list' };
                }
                catch (error) {
                    console.log(error);
                    return { success: false, error: 'Unvalid data' };
                }
            });
        }
        getWatchedList(username) {
            return __awaiter(this, void 0, void 0, function* () {
                const user = yield (0, users_service_1.userExists)(username);
                if (!user.success) {
                    return { success: false, error: user.error };
                }
                else {
                    try {
                        const uid = user.data.uid;
                        const moviesList = yield Watched_1.Watched.findAll({ where: { uid: uid }, attributes: ['mid'] });
                        return { success: true, data: moviesList };
                    }
                    catch (error) {
                        console.log(error);
                        return { success: false, error: 'Unvalid data' };
                    }
                }
            });
        }
        removeFromWatchedList(username, mid) {
            return __awaiter(this, void 0, void 0, function* () {
                const user = yield (0, users_service_1.userExists)(username);
                if (!user.success) {
                    return { success: false, error: user.error };
                }
                else {
                    try {
                        const uid = user.data.uid;
                        const movieOnList = yield this.movieOnList(uid, mid);
                        if (!movieOnList.success) {
                            return { success: false, error: movieOnList.error };
                        }
                        yield Watched_1.Watched.destroy({ where: { uid: uid, mid: mid } });
                        return { success: true, data: 'Movie eliminated from your Watched List' };
                    }
                    catch (error) {
                        console.log(error);
                        return { success: false, error: 'Unvalid data' };
                    }
                }
            });
        }
        addToWatchedList(username, mid, rate) {
            return __awaiter(this, void 0, void 0, function* () {
                const user = yield (0, users_service_1.userExists)(username);
                if (!user.success) {
                    return { success: false, error: user.error };
                }
                else {
                    try {
                        const uid = user.data.uid;
                        const movieOnList = yield this.movieOnList(uid, mid);
                        if (movieOnList.success) {
                            return { success: false, error: 'Movie is already on your Watched List' };
                        }
                        yield Watched_1.Watched.create({ uid: uid, mid: mid, rate: rate });
                        return { success: true, data: 'Movie added to your Watched List' };
                    }
                    catch (error) {
                        console.log(error);
                        return { success: false, error: 'Unvalid data' };
                    }
                }
            });
        }
        searchMovie(filter) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.moviesApi.searchMovie(filter);
            });
        }
    };
    __setFunctionName(_classThis, "MoviesService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MoviesService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MoviesService = _classThis;
})();
exports.MoviesService = MoviesService;
//TODO: COMPROBAR QUE LA MOVIE EXISTE EN LA API POR EL ID?
