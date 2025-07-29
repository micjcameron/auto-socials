import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { seedDatabase } from './seed.utils';
import { Logger } from '@nestjs/common';
import AppDataSource from '../database/database.config';
import { config } from 'dotenv';

// ✅ Load environment variables manually
config();

async function runSeeder() {
  const logger = new Logger('Seeder');

  try {
    console.log('🔄 Initializing database connection...');

    // ✅ Ensure TypeORM is initialized before running migrations
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established!');
    } else {
      console.log('✅ Database connection already initialized.');
    }

    console.log('🌱 Running database seeders...');
    console.log('ℹ️ Database Connection:', AppDataSource.options);

    // Check for V2 flag
    const useV2 = process.argv.includes('--v2') || process.env.SEED_VERSION === 'v2';
    if (useV2) {
      console.log('🚀 Using V2 seeding with enhanced questions and sessions');
    }

    const app = await NestFactory.createApplicationContext(AppModule); // ✅ Bootstrap without HTTP server
    const dataSource = app.get(DataSource);

    logger.log('🌱 Running database seeder...');
    await seedDatabase(dataSource);

    logger.log('✅ Seeding complete!');
    await app.close(); // ✅ Cleanly close the app context
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
  } finally {
    await AppDataSource.destroy(); // ✅ Properly close the database connection
  }
}

runSeeder();
