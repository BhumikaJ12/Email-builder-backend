const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USERNAME,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST,
    dialect: 'postgres',
  }
);

sequelize
  .authenticate()
  .then(() => console.log('PostgreSQL connected'))
  .catch((err) => console.error('Database connection error:', err));

module.exports = sequelize;
