"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const klk_1 = require("./klk");
const auth_routes_1 = require("./routes/auth-routes");
const movies_routes_1 = require("./routes/movies-routes");
function init() {
    const app = new klk_1.App([new auth_routes_1.authRoutes(), new movies_routes_1.routerMovies()]);
    app.listen();
}
init();
