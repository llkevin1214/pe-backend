import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as dayjs from 'dayjs';

/**
 * HTTP Exception Filter
 * Provides consistent error handling and logging for all HTTP exceptions
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * Catch and handle HTTP exceptions
   * @param exception The HTTP exception
   * @param host The execution context
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Create standardized error response
    const errorResponse = {
      statusCode: status,
      timestamp: dayjs().toISOString(),
      path: request.url,
      method: request.method,
      message: this.getErrorMessage(exceptionResponse),
      error: this.getErrorType(status),
    };

    // Log the error
    this.logger.error(
      `HTTP Exception: ${status} - ${request.method} ${request.url}`,
      {
        error: exceptionResponse,
        userAgent: request.get('User-Agent'),
        ip: request.ip,
        apiKey: request.headers['x-api-key'] ? '[REDACTED]' : undefined,
      },
    );

    // Send the error response
    response.status(status).json(errorResponse);
  }

  /**
   * Extract error message from exception response
   * @param exceptionResponse The exception response
   * @returns Error message string
   */
  private getErrorMessage(exceptionResponse: any): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (exceptionResponse.message) {
      if (Array.isArray(exceptionResponse.message)) {
        return exceptionResponse.message[0];
      }
      return exceptionResponse.message;
    }

    return 'Internal server error';
  }

  /**
   * Get error type based on HTTP status code
   * @param status HTTP status code
   * @returns Error type string
   */
  private getErrorType(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too Many Requests';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal Server Error';
      default:
        return 'Error';
    }
  }
}
