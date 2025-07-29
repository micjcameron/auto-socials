import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { AllExceptionsFilter } from './utils/filters/http-exception.filter';

async function initializeDatabase(dataSource: DataSource) {
  const logger = new Logger('Database');

  try {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      logger.log('✅ Database connection established');
    } else {
      logger.log('⚠ Database connection already exists.');
    }
  } catch (error) {
    logger.error('❌ Error connecting to the database:', error);
    process.exit(1); // Stop the app if DB connection fails
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('MainApp');

  // Increase body size limit to 10MB for file uploads
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // Apply global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Temporarily disable to debug
      transform: true,
    })
  );

  // Register global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Enable CORS
  // app.enableCors({
  //   origin: process.env.FRONTEND_DOMAIN?.split(',') || "*",
  //   credentials: true,
  //   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  //   allowedHeaders: "Content-Type, Authorization",
  // });

  // Initialize database connection
  const dataSource = app.get(DataSource);
  await initializeDatabase(dataSource);

  // Start the server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Auto-Socials API running on http://localhost:${port}`);
  logger.log(`📊 Health check: http://localhost:${port}/health`);
}

bootstrap().catch(error => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
