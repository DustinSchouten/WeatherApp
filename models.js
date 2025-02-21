export const CityTemperatureModel = (sequelize, DataTypes) => {
   return sequelize.define('city_temperature', { // The tablename will be pluralized in the database
      cityName: { type: DataTypes.STRING(255), allowNull: false },
      countryCode: { type: DataTypes.STRING(2), allowNull: true },
      countryName: { type: DataTypes.STRING(255), allowNull: true },
      temperature: { type: DataTypes.INTEGER, allowNull: false },
      description: { type: DataTypes.STRING(255), allowNull: false },
   }, {});
};

