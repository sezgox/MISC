import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(process.env.DBNAME ?? 'movieswatched','root',process.env.DBPASS ?? 'klkmanin2000',{dialect: 'mysql',host:'localhost'});