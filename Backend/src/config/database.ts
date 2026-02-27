import { Sequelize } from 'sequelize';
import { config } from './index';
import logger from './logger';

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  username: config.database.user,
  password: config.database.password,
  logging: config.nodeEnv === 'development' ? (msg: string) => logger.debug(msg) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
});

export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.error('Unable to connect to the database', { error: (error as Error).message });
    throw error;
  }
};

export const syncDatabase = async (force = false): Promise<void> => {
  try {
    await sequelize.sync({ force, alter: !force });
    logger.info('Database synchronized successfully');
  } catch (error) {
    logger.error('Database synchronization failed', { error: (error as Error).message });
    throw error;
  }
};
