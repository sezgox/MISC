"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importStar(require("express"));
const Users_1 = require("./models/Users");
const Watched_1 = require("./models/Watched");
class App {
    constructor(routes) {
        var _a;
        process.loadEnvFile('.env');
        this.port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : '3000';
        this.app = (0, express_1.default)();
        this.initMiddlewares();
        this.initRoutes(routes);
        this.connectDB();
    }
    initRoutes(routes) {
        routes.forEach(route => {
            this.app.use('/', route.router);
        });
    }
    initMiddlewares() {
        this.app.use((0, express_1.json)());
        this.app.use((0, cors_1.default)());
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log('Listening on port ', this.port);
        });
    }
    connectDB() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Users_1.User.sync();
                yield Watched_1.Watched.sync();
                console.log('DB Connected');
            }
            catch (error) {
                console.log(error);
            }
        });
    }
}
exports.App = App;
