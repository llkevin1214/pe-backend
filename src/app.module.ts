import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChargersModule } from './chargers/chargers.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { Logger } from './common/logger/logger.service';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseConfig } from './config/database.config';
import { AppCacheModule } from './config/cache.module';
import { AdminModule } from './admin/admin.module';

/**
 * Application Main Module
 * Configures all sub-modules, database connections, global interceptors, etc.
 */
@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database module
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),

    // Cache module
    AppCacheModule,

    // Business modules
    ChargersModule,
    AuthModule,
    AdminModule,
  ],
  controllers: [HealthController],
  providers: [
    // Global logger service
    Logger,

    // Global logging interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
