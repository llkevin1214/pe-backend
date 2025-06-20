import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

/**
 * Custom Logger Service
 * Based on Winston implementation, supports log rotation and multiple log levels
 */
@Injectable()
export class Logger implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    this.initializeLogger();
  }

  /**
   * Initialize logger configuration
   * Sets up log format, output location, and rotation strategy
   */
  private initializeLogger(): void {
    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    );

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      transports: [
        // Console transport
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        // File transport with rotation
        new DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
        // Error file transport
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'error',
        }),
      ],
    });
  }

  /**
   * Log information message
   * @param message - Log message
   * @param context - Log context (optional)
   */
  log(message: any, context?: string): void {
    this.logger.info(message, { context });
  }

  /**
   * Log error message
   * @param message - Error message
   * @param trace - Error stack trace (optional)
   * @param context - Log context (optional)
   */
  error(message: any, trace?: string, context?: string): void {
    this.logger.error(message, { trace, context });
  }

  /**
   * Log warning message
   * @param message - Warning message
   * @param context - Log context (optional)
   */
  warn(message: any, context?: string): void {
    this.logger.warn(message, { context });
  }

  /**
   * Log debug message
   * @param message - Debug message
   * @param context - Log context (optional)
   */
  debug(message: any, context?: string): void {
    this.logger.debug(message, { context });
  }

  /**
   * Log verbose message
   * @param message - Verbose message
   * @param context - Log context (optional)
   */
  verbose(message: any, context?: string): void {
    this.logger.verbose(message, { context });
  }
}
