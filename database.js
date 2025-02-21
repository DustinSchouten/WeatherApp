import Sequelize from "sequelize";
import { CityTemperatureModel } from './models.js';

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
   host: process.env.DB_HOST,
   port: process.env.DB_PORT,
   dialect: 'mysql'
});

const database = {
   sequelize,
   models: {
      CityTemperature: CityTemperatureModel(sequelize, Sequelize.DataTypes),
   },
};

export default database