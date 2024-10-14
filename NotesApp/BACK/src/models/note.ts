import { DataTypes } from "sequelize";
import sequelize from "../database/connection";
import { User } from "./user";

export const Note = sequelize.define('notes', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title:{
        type: DataTypes.STRING,
        allowNull: false
    },
    description:{
        type: DataTypes.STRING,
        allowNull: false
    },
    showAll:{
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    user:{
        type: DataTypes.STRING,
        references: {model: 'users',key:'username'}
    }
})
// Define la relación entre User y Note

User.hasMany(Note, {
    foreignKey: 'user', // La columna en Note que hace referencia a la clave primaria de User
    onUpdate: 'CASCADE', // Comportamiento de actualización
    onDelete: 'CASCADE', // Comportamiento de eliminación
    as: 'UserAssociation' // Cambia el nombre de la asociación
});

Note.belongsTo(User, {
    foreignKey: 'user', // La columna en Note que hace referencia a la clave primaria de User
    targetKey: 'username',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE', // La columna en User a la que hace referencia la clave externa
    as: 'UserAssociation' // Cambia el nombre de la asociación
});
