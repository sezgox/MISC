"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
exports.sequelize = new sequelize_1.Sequelize((_a = process.env.DBNAME) !== null && _a !== void 0 ? _a : 'movieswatched', 'root', (_b = process.env.DBPASS) !== null && _b !== void 0 ? _b : 'klkmanin2000', { dialect: 'mysql', host: 'localhost' });
