import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChargersController } from './chargers.controller';
import { ChargersService } from './chargers.service';
import { Charger } from '../entities/charger.entity';
import { Partner } from '../entities/partner.entity';
import { Logger } from '../common/logger/logger.service';
import { CacheService } from '../common/services/cache.service';
import { AppCacheModule } from '../config/cache.module';
import { ApiKeyAuthGuard } from '../common/guards/api-key-auth.guard';
import { UnionAuthGuard } from '../common/guards/union-auth.guard';

/**
 * Charger Module
 * Provides charger-related business functionality including status management and control operations
 */
@Module({
  imports: [TypeOrmModule.forFeature([Charger, Partner]), AppCacheModule],
  controllers: [ChargersController],
  providers: [
    ChargersService,
    Logger,
    CacheService,
    ApiKeyAuthGuard,
    UnionAuthGuard,
  ],
  exports: [ChargersService],
})
export class ChargersModule {}
