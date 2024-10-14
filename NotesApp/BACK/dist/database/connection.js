"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize((_a = process.env.SQL_SCHEMA) !== null && _a !== void 0 ? _a : 'mynotes', 'root', (_b = process.env.SQL_PASSWORD) !== null && _b !== void 0 ? _b : 'klkmanin2000', {
    host: 'localhost',
    dialect: 'mysql'
});
exports.default = sequelize;
