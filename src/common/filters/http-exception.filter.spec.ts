import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpExceptionFilter } from './http-exception.filter.js';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('should format HttpException correctly', () => {
    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => ({ status: statusMock }),
        getRequest: () => ({ url: '/test-url' }),
      }),
    } as unknown as ArgumentsHost;

    const exception = new HttpException('Forbidden access', HttpStatus.FORBIDDEN);
    filter.catch(exception, mockHost);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Forbidden access',
        statusCode: HttpStatus.FORBIDDEN,
        path: '/test-url',
      }),
    );
  });

  it('should format BadRequestException with validation errors correctly', () => {
    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => ({ status: statusMock }),
        getRequest: () => ({ url: '/auth/register' }),
      }),
    } as unknown as ArgumentsHost;

    const exception = new BadRequestException([
      'email must be an email',
      'password is too short',
    ]);
    filter.catch(exception, mockHost);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'email must be an email, password is too short',
        statusCode: HttpStatus.BAD_REQUEST,
        errors: ['email must be an email', 'password is too short'],
        path: '/auth/register',
      }),
    );
  });
});
