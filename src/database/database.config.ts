import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DefaultNamingStrategy } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

// ✅ Load configuration for both NestJS & CLI
const appConfig = {
  databaseHost: process.env.DB_HOST || 'localhost',
  databasePort: process.env.DB_PORT || 5432,
  databaseUser: process.env.DB_USERNAME || 'auto_socials',
  databasePassword: process.env.DB_PASSWORD || 'auto_socials_password',
  databaseName: process.env.DB_DATABASE || 'auto_socials',
};

console.log('Database Config:', appConfig);

// ✅ Function for NestJS (returns TypeOrmModuleOptions)
export const getTypeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres' as const,
  host: appConfig.databaseHost,
  port: +appConfig.databasePort,
  username: appConfig.databaseUser,
  password: appConfig.databasePassword,
  database: appConfig.databaseName,
  autoLoadEntities: true,
  synchronize: true, // Enable auto-schema creation
  retryAttempts: 5,
  namingStrategy: new DefaultNamingStrategy(),
});

// ✅ Function for TypeORM CLI (returns DataSourceOptions)
export const getDataSourceOptions = (): DataSourceOptions => ({
  type: 'postgres' as const,
  host: appConfig.databaseHost,
  port: +appConfig.databasePort,
  username: appConfig.databaseUser,
  password: appConfig.databasePassword,
  database: appConfig.databaseName,
  entities: ['src/**/*.entity.ts'],
  migrations: [
    'src/database/migrations/**/*.ts', // for TypeScript during development
  ],
  migrationsTableName: 'migrations',
  namingStrategy: new DefaultNamingStrategy(),
});

// ✅ Create TypeORM `DataSource` instance for CLI
const AppDataSource = new DataSource(getDataSourceOptions());

export default AppDataSource;
