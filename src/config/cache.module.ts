import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisConfig } from './redis.config';

/**
 * Cache Module
 * Provides Redis-based caching functionality across the application
 */
@Global()
@Module({
  imports: [CacheModule.register(redisConfig)],
  exports: [CacheModule],
})
export class AppCacheModule {}
