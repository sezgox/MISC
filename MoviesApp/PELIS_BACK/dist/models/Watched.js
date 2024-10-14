"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Watched = void 0;
const sequelize_1 = require("sequelize");
const Users_1 = require("./Users");
const database_1 = require("./database");
exports.Watched = database_1.sequelize.define('watched', {
    uid: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
    },
    mid: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    rate: {
        type: sequelize_1.DataTypes.TINYINT,
        allowNull: true,
        defaultValue: null,
        validate: {
            max: 10,
            min: 0
        }
    }
});
exports.Watched.belongsTo(Users_1.User, {
    foreignKey: 'uid',
    targetKey: 'uid',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    as: 'UserAssociation'
});
