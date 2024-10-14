import { App } from "./klk";
import { authRoutes } from "./routes/auth-routes";
import { routerMovies } from "./routes/movies-routes";

function init(){
    const app = new App([new authRoutes(), new routerMovies()]);
    app.listen();
}

init();
