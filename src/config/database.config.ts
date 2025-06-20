import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Charger } from '../entities/charger.entity';
import { Partner } from '../entities/partner.entity';
import { AdminUser } from '@/entities/admin-user.entity';

/**
 * Database Configuration Class
 * Responsible for providing TypeORM database connection configuration
 */
@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  /**
   * Create TypeORM configuration options
   * @returns TypeORM configuration object
   */
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('DB_HOST', 'localhost'),
      port: this.configService.get('DB_PORT', 5432),
      username: this.configService.get('DB_USERNAME', 'postgres'),
      password: this.configService.get('DB_PASSWORD', ''),
      database: this.configService.get('DB_NAME', 'ev_charging'),
      schema: this.configService.get('DB_SCHEMA', 'public'),
      entities: [Charger, Partner, AdminUser],
      synchronize: this.configService.get('NODE_ENV') !== 'production',
      logging: this.configService.get('NODE_ENV') !== 'production',
      ssl:
        this.configService.get('NODE_ENV') === 'production'
          ? { rejectUnauthorized: false }
          : false,
      poolSize: 20,
      extra: {
        connectionLimit: 10,
        acquireTimeout: 60000,
        timeout: 60000,
      },
    };
  }
}
