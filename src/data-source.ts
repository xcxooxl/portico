import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: 5432,
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'postgres',
  synchronize: true,
  logging: false,
  entities: [__dirname + '/models/*.model.js'],
  migrations: [__dirname + '/migrations/*.js'],
  subscribers: [],
});

// if (!AppDataSource.isInitialized) AppDataSource.initialize();
