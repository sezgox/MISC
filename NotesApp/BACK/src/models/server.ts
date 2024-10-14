import cors from 'cors';
import express, { Application } from 'express';
import routerNotes from '../routes/notes';
import routerUser from '../routes/users';
import { Note } from './note';
import { User } from './user';

class Server {
    private app: Application;
    private port: string;

    constructor(){
        this.app = express();
        this.port = process.env.PORT || '3002';
        this.listen();
        this.middlewares();
        this.routes();
        this.dbConnection();
    }

    listen(){
        this.app.listen(this.port, () => {
            console.log(`Listening on port ${this.port}`)
        })
    }

    routes(){
        this.app.use('/users', routerUser);
        this.app.use('/notes', routerNotes);
    }

    middlewares(){
        this.app.use(express.json());
        this.app.use(cors());
    }

    async dbConnection(){
        try {
            await User.sync();
            await Note.sync();
            console.log('Connected to db');
        } catch (error) {
            console.log('Not connected to db' + error);
        }
    }

}

export default Server;