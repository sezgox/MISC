import cors from "cors";
import express, { Application, json } from "express";
import { Routes } from './interfaces/routes-interface';
import { User } from './models/Users';
import { Watched } from './models/Watched';

export class App{

    app: Application;
    port: string;
    

    constructor(routes:Routes[]){
        process.loadEnvFile('.env');
        this.port =  process.env.PORT ?? '3000';
        this.app = express();
        this.initMiddlewares();
        this.initRoutes(routes);
        this.connectDB();
    }

    initRoutes(routes:Routes[]){
        routes.forEach(route => {
            this.app.use('/', route.router);
        });
    }


    initMiddlewares(){
        this.app.use(json())
        this.app.use(cors())
    }

    listen(){
        this.app.listen( this.port,() => {
            console.log('Listening on port ', this.port)
        })
    }

    async connectDB(){
        try {
            await User.sync();
            await Watched.sync();
            console.log('DB Connected')
        } catch (error) {
            console.log(error)
        }
    }

}