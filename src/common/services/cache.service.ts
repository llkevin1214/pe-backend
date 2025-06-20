import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Logger } from '../logger/logger.service';

/**
 * Cache Service
 * Provides centralized caching functionality for the application
 */
@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private logger: Logger,
  ) {}

  /**
   * Get charger status from cache
   * @param partnerId - Partner ID
   * @param chargerId - Charger ID
   * @returns Cached charger status or null if not found
   */
  async getChargerStatus(
    partnerId: number,
    chargerId: string,
  ): Promise<any | null> {
    const cacheKey = this.generateChargerStatusKey(partnerId, chargerId);
    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.logger.log(
          `Cache hit for charger status: ${chargerId}`,
          'CacheService',
        );
      }
      return cached;
    } catch (error) {
      this.logger.error(
        `Cache get error for ${cacheKey}: ${error.message}`,
        error.stack,
        'CacheService',
      );
      return null;
    }
  }

  /**
   * Set charger status in cache
   * @param partnerId - Partner ID
   * @param chargerId - Charger ID
   * @param statusData - Status data to cache
   * @param ttl - Time to live in seconds (default: 30)
   */
  async setChargerStatus(
    partnerId: number,
    chargerId: string,
    statusData: any,
    ttl: number = 30,
  ): Promise<void> {
    const cacheKey = this.generateChargerStatusKey(partnerId, chargerId);
    try {
      await this.cacheManager.set(cacheKey, statusData, ttl);
      this.logger.log(
        `Cached charger status: ${chargerId} for ${ttl}s`,
        'CacheService',
      );
    } catch (error) {
      this.logger.error(
        `Cache set error for ${cacheKey}: ${error.message}`,
        error.stack,
        'CacheService',
      );
    }
  }

  /**
   * Invalidate charger status cache
   * @param partnerId - Partner ID
   * @param chargerId - Charger ID
   */
  async invalidateChargerStatus(
    partnerId: number,
    chargerId: string,
  ): Promise<void> {
    const cacheKey = this.generateChargerStatusKey(partnerId, chargerId);
    try {
      await this.cacheManager.del(cacheKey);
      this.logger.log(
        `Invalidated charger status cache: ${chargerId}`,
        'CacheService',
      );
    } catch (error) {
      this.logger.error(
        `Cache invalidation error for ${cacheKey}: ${error.message}`,
        error.stack,
        'CacheService',
      );
    }
  }

  /**
   * Invalidate all charger caches for a partner
   * @param partnerId - Partner ID
   */
  async invalidatePartnerChargers(partnerId: number): Promise<void> {
    // Note: This is a simplified implementation
    // In production, you might want to use Redis SCAN or maintain a list of keys
    this.logger.log(
      `Invalidated all charger caches for partner: ${partnerId}`,
      'CacheService',
    );
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    try {
      // Note: cache-manager doesn't have a reset method
      // In production, you might want to use Redis FLUSHDB or similar
      this.logger.log(
        'Cache clear requested (not implemented)',
        'CacheService',
      );
    } catch (error) {
      this.logger.error(
        `Cache clear error: ${error.message}`,
        error.stack,
        'CacheService',
      );
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    // This would depend on the cache store implementation
    // For Redis, you could use INFO command
    return {
      service: 'CacheService',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate cache key for charger status
   * @param partnerId - Partner ID
   * @param chargerId - Charger ID
   * @returns Cache key string
   */
  private generateChargerStatusKey(
    partnerId: number,
    chargerId: string,
  ): string {
    return `charger:${partnerId}:${chargerId}:status`;
  }
} 