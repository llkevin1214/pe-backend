import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from './common/logger/logger.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import * as compression from 'compression';

/**
 * Application Bootstrap Function
 * Configures NestJS application, validation pipes, Swagger documentation, etc.
 */
async function bootstrap() {
  // Create NestJS application instance
  const app = await NestFactory.create(AppModule, {
    logger: new Logger(),
  });

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS configuration
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    credentials: true,
  });

  // Swagger documentation configuration
  const config = new DocumentBuilder()
    .setTitle('Electric Vehicle Charging Solution API')
    .setDescription('REST API for partner charger management')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'Partner API Key',
      },
      'api-key',
    )
    .addTag('chargers', '[External + Internal] Charger Management')
    .addTag('auth', '[Internal] Partner Authentication')
    .addTag('health', '[Internal] Health Check')
    .addTag('admin', '[Internal] Admin Management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start application
  const port = process.env.PORT || 3000;
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`Application started, listening on port: ${port}`, 'Bootstrap');
  logger.log(
    `Swagger documentation available at: http://localhost:${port}/api/docs`,
    'Bootstrap',
  );
  logger.log(
    `Documentation site available at: http://localhost:3001`,
    'Bootstrap',
  );
}

// Bootstrap the application
bootstrap().catch((error) => {
  console.error('Application startup failed:', error);
  process.exit(1);
});
