"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Note = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const user_1 = require("./user");
exports.Note = connection_1.default.define('notes', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    showAll: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false
    },
    user: {
        type: sequelize_1.DataTypes.STRING,
        references: { model: 'users', key: 'username' }
    }
});
// Define la relación entre User y Note
user_1.User.hasMany(exports.Note, {
    foreignKey: 'user', // La columna en Note que hace referencia a la clave primaria de User
    onUpdate: 'CASCADE', // Comportamiento de actualización
    onDelete: 'CASCADE', // Comportamiento de eliminación
    as: 'UserAssociation' // Cambia el nombre de la asociación
});
exports.Note.belongsTo(user_1.User, {
    foreignKey: 'user', // La columna en Note que hace referencia a la clave primaria de User
    targetKey: 'username',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE', // La columna en User a la que hace referencia la clave externa
    as: 'UserAssociation' // Cambia el nombre de la asociación
});
