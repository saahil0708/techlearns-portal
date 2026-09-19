var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
import { Catch, HttpException, HttpStatus, Logger, } from '@nestjs/common';
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    logger = new Logger(HttpExceptionFilter_1.name);
    catch(exception, host) {
        if ((typeof host.getType === 'function' && host.getType() === 'graphql') || !host.switchToHttp().getResponse()) {
            return exception;
        }
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        if (!response || typeof response.status !== 'function') {
            return exception;
        }
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'INTERNAL_SERVER_ERROR';
        let details = undefined;
        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
                error = exception.name;
            }
            else if (typeof exceptionResponse === 'object' &&
                exceptionResponse !== null) {
                const resObj = exceptionResponse;
                message =
                    (Array.isArray(resObj.message)
                        ? resObj.message.join(', ')
                        : resObj.message) || exception.message;
                error =
                    resObj.error || exception.name || HttpStatus[statusCode];
                if (Array.isArray(resObj.message)) {
                    details = resObj.message;
                }
            }
        }
        else if (exception instanceof Error) {
            this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
            message = process.env.NODE_ENV === 'production' ? 'Internal server error' : exception.message;
            error = 'InternalServerError';
        }
        const errorResponse = {
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
};
HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    Catch()
], HttpExceptionFilter);
export { HttpExceptionFilter };
//# sourceMappingURL=http-exception.filter.js.map