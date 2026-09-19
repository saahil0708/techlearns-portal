import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResponseInterceptor } from './response.interceptor.js';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<unknown>;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    interceptor = new ResponseInterceptor(reflector);
  });

  it('should transform data into standard API response envelope', async () => {
    const mockContext = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
    } as unknown as ExecutionContext;

    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(
      'Custom success message',
    );

    const callHandler = {
      handle: () => of({ id: '123', name: 'Test' }),
    };

    const observable = interceptor.intercept(mockContext, callHandler);
    observable.subscribe((result) => {
      expect(result).toEqual({
        success: true,
        message: 'Custom success message',
        data: { id: '123', name: 'Test' },
      });
    });
  });

  it('should handle pre-formatted data with metadata', async () => {
    const mockContext = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
    } as unknown as ExecutionContext;

    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue('Default message');

    const callHandler = {
      handle: () =>
        of({
          message: 'Users fetched',
          data: [{ id: '1' }],
          meta: { page: 1, total: 1 },
        }),
    };

    const observable = interceptor.intercept(mockContext, callHandler);
    observable.subscribe((result) => {
      expect(result).toEqual({
        success: true,
        message: 'Users fetched',
        data: [{ id: '1' }],
        meta: { page: 1, total: 1 },
      });
    });
  });
});
