import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Partner } from '../entities/partner.entity';
import { Charger } from '../entities/charger.entity';
import { ApiKeyStrategy } from './strategies/api-key.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule } from '@nestjs/config';

/**
 * Authentication Module
 * Handles API key authentication and partner management
 */
@Module({
  imports: [TypeOrmModule.forFeature([Partner, Charger]), ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, ApiKeyStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {
  constructor() {
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
  }
}
