import { DataTypes } from "sequelize";
import { sequelize } from "./database";

export const User = sequelize.define('users',{
    uid:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    username:{
        type: DataTypes.STRING,
        unique: true
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false
    }
});