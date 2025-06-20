import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';
import { Logger } from '../logger/logger.service';

describe('CacheService', () => {
  let service: CacheService;
  let mockCacheManager: any;
  let mockLogger: any;

  beforeEach(async () => {
    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getChargerStatus', () => {
    it('should return cached status when available', async () => {
      const mockCachedData = { chargerId: 'CHARGER001', status: 'AVAILABLE' };
      mockCacheManager.get.mockResolvedValue(mockCachedData);

      const result = await service.getChargerStatus(1, 'CHARGER001');

      expect(result).toEqual(mockCachedData);
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        'charger:1:CHARGER001:status',
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Cache hit for charger status: CHARGER001',
        'CacheService',
      );
    });

    it('should return null when cache miss', async () => {
      mockCacheManager.get.mockResolvedValue(null);

      const result = await service.getChargerStatus(1, 'CHARGER001');

      expect(result).toBeNull();
      expect(mockLogger.log).not.toHaveBeenCalled();
    });

    it('should handle cache errors gracefully', async () => {
      const error = new Error('Cache error');
      mockCacheManager.get.mockRejectedValue(error);

      const result = await service.getChargerStatus(1, 'CHARGER001');

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Cache get error for charger:1:CHARGER001:status: Cache error',
        error.stack,
        'CacheService',
      );
    });
  });

  describe('setChargerStatus', () => {
    it('should set charger status in cache', async () => {
      const statusData = { chargerId: 'CHARGER001', status: 'AVAILABLE' };
      mockCacheManager.set.mockResolvedValue(undefined);

      await service.setChargerStatus(1, 'CHARGER001', statusData, 30);

      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'charger:1:CHARGER001:status',
        statusData,
        30,
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Cached charger status: CHARGER001 for 30s',
        'CacheService',
      );
    });

    it('should handle cache set errors gracefully', async () => {
      const error = new Error('Cache set error');
      mockCacheManager.set.mockRejectedValue(error);

      await service.setChargerStatus(1, 'CHARGER001', {}, 30);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Cache set error for charger:1:CHARGER001:status: Cache set error',
        error.stack,
        'CacheService',
      );
    });
  });

  describe('invalidateChargerStatus', () => {
    it('should invalidate charger status cache', async () => {
      mockCacheManager.del.mockResolvedValue(undefined);

      await service.invalidateChargerStatus(1, 'CHARGER001');

      expect(mockCacheManager.del).toHaveBeenCalledWith(
        'charger:1:CHARGER001:status',
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Invalidated charger status cache: CHARGER001',
        'CacheService',
      );
    });

    it('should handle cache invalidation errors gracefully', async () => {
      const error = new Error('Cache invalidation error');
      mockCacheManager.del.mockRejectedValue(error);

      await service.invalidateChargerStatus(1, 'CHARGER001');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Cache invalidation error for charger:1:CHARGER001:status: Cache invalidation error',
        error.stack,
        'CacheService',
      );
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      const stats = await service.getStats();

      expect(stats).toHaveProperty('service', 'CacheService');
      expect(stats).toHaveProperty('timestamp');
      expect(new Date(stats.timestamp)).toBeInstanceOf(Date);
    });
  });
});
