import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiErrorResponse } from '../types/response.type.js';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    if ((typeof host.getType === 'function' && host.getType<string>() === 'graphql') || !host.switchToHttp().getResponse()) {
      return exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (!response || typeof response.status !== 'function') {
      return exception;
    }

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'INTERNAL_SERVER_ERROR';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resObj = exceptionResponse as Record<string, unknown>;
        message =
          (Array.isArray(resObj.message)
            ? resObj.message.join(', ')
            : (resObj.message as string)) || exception.message;
        error =
          (resObj.error as string) || exception.name || HttpStatus[statusCode];
        if (Array.isArray(resObj.message)) {
          details = resObj.message;
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
      message = process.env.NODE_ENV === 'production' ? 'Internal server error' : exception.message;
      error = 'InternalServerError';
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      message,
      error,
      statusCode,
      ...(details ? { errors: details } : {}),
      timestamp: new Date().toISOString(),
      path: request?.url || '',
    };

    response.status(statusCode).json(errorResponse);
  }
}
