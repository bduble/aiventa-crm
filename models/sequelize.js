import { Sequelize } from 'sequelize';

const connectionString = process.env.DATABASE_URL || 'sqlite::memory:';

const sequelize = new Sequelize(connectionString, {
  logging: false,
});

export default sequelize;
