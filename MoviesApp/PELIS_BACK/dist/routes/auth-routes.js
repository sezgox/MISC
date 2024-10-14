"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth-controller");
class authRoutes {
    constructor() {
        this.path = '/auth';
        this.router = (0, express_1.Router)();
        this.initRoutes();
    }
    initRoutes() {
        this.router.post(`${this.path}`, auth_controller_1.register);
        this.router.post(`${this.path}/login`, auth_controller_1.login);
    }
}
exports.authRoutes = authRoutes;
