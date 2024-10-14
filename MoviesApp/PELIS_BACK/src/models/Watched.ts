import { DataTypes } from "sequelize";
import { User } from "./Users";
import { sequelize } from "./database";

export const Watched = sequelize.define('watched',{
    uid:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    mid:{
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    rate:{
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: null,
        validate:{
            max: 10,
            min: 0
        }
    }
});

Watched.belongsTo(User, {
    foreignKey: 'uid',
    targetKey: 'uid',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    as: 'UserAssociation'
});


