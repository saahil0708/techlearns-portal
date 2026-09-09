import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator.js';
import { ApiResponse } from '../types/response.type.js';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    // For GraphQL requests, skip envelope wrapping as GraphQL requires the raw object schema
    if (context.getType<string>() === 'graphql' || (context as any).getType?.() === 'graphql') {
      return next.handle();
    }

    const defaultMessage =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || 'Operation completed successfully';

    return next.handle().pipe(
      map((res) => {
        // If the service/controller already provided a structured response with meta or data
        if (
          res &&
          typeof res === 'object' &&
          ('data' in res || 'meta' in res || 'message' in res)
        ) {
          return {
            success: true,
            message: res.message || defaultMessage,
            data: res.data !== undefined ? res.data : res,
            ...(res.meta ? { meta: res.meta } : {}),
          };
        }

        return {
          success: true,
          message: defaultMessage,
          data: res ?? null,
        };
      }),
    );
  }
}
