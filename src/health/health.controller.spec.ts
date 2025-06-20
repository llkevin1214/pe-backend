import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HealthController } from './health.controller';
import { DataSource } from 'typeorm';
import * as dayjs from 'dayjs';

describe('HealthController', () => {
  let controller: HealthController;
  let mockDataSource: any;
  let mockCacheManager: any;

  beforeEach(async () => {
    mockDataSource = {
      query: jest.fn().mockResolvedValue([{ '1': 1 }]),
    };

    mockCacheManager = {
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue('ok'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('basicHealthCheck', () => {
    it('should return basic health status', async () => {
      const result = await controller.basicHealthCheck();

      expect(result).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
      });
    });

    it('should include required health check fields', async () => {
      const result = await controller.basicHealthCheck();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
    });

    it('should return status as ok', async () => {
      const result = await controller.basicHealthCheck();

      expect(result.status).toBe('ok');
    });

    it('should return valid timestamp', async () => {
      const result = await controller.basicHealthCheck();
      const timestamp = dayjs(result.timestamp).toDate();

      expect(timestamp.getTime()).toBeGreaterThan(0);
      expect(timestamp).toBeInstanceOf(Date);
    });
  });

  describe('detailedHealthCheck', () => {
    it('should return detailed health status', async () => {
      const result = await controller.detailedHealthCheck();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('environment');
      expect(result).toHaveProperty('services');
    });

    it('should check database health', async () => {
      const result = await controller.detailedHealthCheck();

      expect(result.services.database).toHaveProperty('status');
      expect(result.services.database).toHaveProperty('responseTime');
      expect(mockDataSource.query).toHaveBeenCalledWith('SELECT 1');
    });

    it('should check Redis health', async () => {
      const result = await controller.detailedHealthCheck();

      expect(result.services.redis).toHaveProperty('status');
      expect(result.services.redis).toHaveProperty('responseTime');
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'health_check',
        'ok',
        10,
      );
      expect(mockCacheManager.get).toHaveBeenCalledWith('health_check');
    });
  });

  describe('readinessCheck', () => {
    it('should return ready status when healthy', async () => {
      const result = await controller.readinessCheck();

      expect(result).toEqual({
        status: 'ready',
        timestamp: expect.any(String),
      });
    });
  });

  describe('livenessCheck', () => {
    it('should return alive status', async () => {
      const result = await controller.livenessCheck();

      expect(result).toEqual({
        status: 'alive',
        timestamp: expect.any(String),
      });
    });
  });
});
