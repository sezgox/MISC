"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routerUsers = void 0;
const express_1 = require("express");
const users_1 = require("../controllers/users");
class routerUsers {
    constructor() {
        this.path = '/users';
        this.router = (0, express_1.Router)();
    }
    initRoutes() {
        this.router.post(`${this.path}`, users_1.register);
        this.router.post(`${this.path}/login`, users_1.login);
    }
}
exports.routerUsers = routerUsers;
