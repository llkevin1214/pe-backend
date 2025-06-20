import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as dayjs from 'dayjs';

/**
 * Health Check Response Interface
 */
interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: {
      status: 'ok' | 'error';
      responseTime?: number;
    };
    redis: {
      status: 'ok' | 'error';
      responseTime?: number;
    };
  };
}

/**
 * Health Check Controller
 * Provides health check endpoints for monitoring and load balancer health checks
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * Basic health check endpoint
   * Used by load balancers and monitoring systems
   */
  @Get()
  @ApiOperation({
    summary: 'Basic health check',
    description: 'Returns a simple health status for load balancers',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application is healthy',
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'Application is unhealthy',
  })
  async basicHealthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: dayjs().toISOString(),
    };
  }

  /**
   * Detailed health check endpoint
   * Provides comprehensive health information including database and Redis status
   */
  @Get('detailed')
  @ApiOperation({
    summary: 'Detailed health check',
    description:
      'Returns comprehensive health information including all services',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All services are healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['ok', 'error'] },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number' },
        version: { type: 'string' },
        environment: { type: 'string' },
        services: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['ok', 'error'] },
                responseTime: { type: 'number' },
              },
            },
            redis: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['ok', 'error'] },
                responseTime: { type: 'number' },
              },
            },
          },
        },
      },
    },
  })
  async detailedHealthCheck(): Promise<HealthCheckResponse> {
    const uptime = process.uptime();

    // Check database health
    const dbStartTime = dayjs().valueOf();
    let dbStatus: 'ok' | 'error' = 'error';
    let dbResponseTime: number | undefined;

    try {
      await this.dataSource.query('SELECT 1');
      dbStatus = 'ok';
      dbResponseTime = dayjs().valueOf() - dbStartTime;
    } catch (error) {
      dbResponseTime = dayjs().valueOf() - dbStartTime;
    }

    // Check Redis health
    const redisStartTime = dayjs().valueOf();
    let redisStatus: 'ok' | 'error' = 'error';
    let redisResponseTime: number | undefined;

    try {
      await this.cacheManager.set('health_check', 'ok', 10);
      const result = await this.cacheManager.get('health_check');
      if (result === 'ok') {
        redisStatus = 'ok';
      }
      redisResponseTime = dayjs().valueOf() - redisStartTime;
    } catch (error) {
      redisResponseTime = dayjs().valueOf() - redisStartTime;
    }

    // Determine overall status
    const overallStatus: 'ok' | 'error' =
      dbStatus === 'ok' && redisStatus === 'ok' ? 'ok' : 'error';

    return {
      status: overallStatus,
      timestamp: dayjs().toISOString(),
      uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
        },
        redis: {
          status: redisStatus,
          responseTime: redisResponseTime,
        },
      },
    };
  }

  /**
   * Readiness check endpoint
   * Used by Kubernetes readiness probes
   */
  @Get('ready')
  @ApiOperation({
    summary: 'Readiness check',
    description: 'Checks if the application is ready to receive traffic',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application is ready',
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'Application is not ready',
  })
  async readinessCheck(): Promise<{ status: string; timestamp: string }> {
    // Check if all critical services are available
    const health = await this.detailedHealthCheck();

    if (health.status === 'ok') {
      return {
        status: 'ready',
        timestamp: dayjs().toISOString(),
      };
    } else {
      throw new Error('Application not ready');
    }
  }

  /**
   * Liveness check endpoint
   * Used by Kubernetes liveness probes
   */
  @Get('live')
  @ApiOperation({
    summary: 'Liveness check',
    description: 'Checks if the application is alive and running',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application is alive',
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'Application is not alive',
  })
  async livenessCheck(): Promise<{ status: string; timestamp: string }> {
    // Simple check to ensure the application is running
    return {
      status: 'alive',
      timestamp: dayjs().toISOString(),
    };
  }
}
