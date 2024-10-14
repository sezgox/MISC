import { Router } from "express";
import { login, register } from "../controllers/auth-controller";
import { Routes } from "../interfaces/routes-interface";


export class authRoutes implements Routes{

    path: string = '/auth'
    router: Router = Router();

    constructor(){
        this.initRoutes();
    }

    initRoutes(){
        this.router.post(`${this.path}`,register)
        this.router.post(`${this.path}/login`,login)
    }

}