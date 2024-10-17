import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(process.env.DBNAME ?? 'movieswatched','root',process.env.DBPASS ?? 'db_pass',{dialect: 'mysql',host:'localhost'});
