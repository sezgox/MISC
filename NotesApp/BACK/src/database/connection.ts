import { Sequelize } from "sequelize";

const sequelize = new Sequelize (process.env.SQL_SCHEMA ?? 'mynotes', 'root', process.env.SQL_PASSWORD ?? 'db_pass', {
    host: 'localhost',
    dialect: 'mysql'
});

export default sequelize;
