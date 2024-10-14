"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("./database");
exports.User = database_1.sequelize.define('users', {
    uid: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
    },
    username: {
        type: sequelize_1.DataTypes.STRING,
        unique: true
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    }
});
