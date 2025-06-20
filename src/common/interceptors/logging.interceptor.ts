import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import * as dayjs from 'dayjs';

/**
 * Logging Interceptor
 * Records detailed information for all HTTP requests, including request start, completion, and error logs
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  /**
   * Intercept HTTP requests and log them
   * @param context - Execution context containing request and response information
   * @param next - Next handler function
   * @returns Observable
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = dayjs().valueOf();

    // Log request start
    this.logger.log(
      `Request started: ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    return next.handle().pipe(
      tap((_: any) => {
        const endTime = dayjs().valueOf();
        const duration = endTime - startTime;

        // Log request completion
        this.logger.log(
          `Request completed: ${method} ${url} - Status: ${response.statusCode} - Duration: ${duration}ms`,
        );
      }),
      tap({
        error: (error) => {
          const endTime = dayjs().valueOf();
          const duration = endTime - startTime;

          // Log request error
          this.logger.error(
            `Request failed: ${method} ${url} - Error: ${error.message} - Duration: ${duration}ms`,
            error.stack,
          );
        },
      }),
    );
  }
}
