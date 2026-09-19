var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator.js';
let ResponseInterceptor = class ResponseInterceptor {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    intercept(context, next) {
        if (typeof context.getType === 'function' && (context.getType() === 'graphql')) {
            return next.handle();
        }
        const defaultMessage = this.reflector.getAllAndOverride(RESPONSE_MESSAGE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) || 'Operation completed successfully';
        return next.handle().pipe(map((res) => {
            if (res &&
                typeof res === 'object' &&
                ('data' in res || 'meta' in res || 'message' in res)) {
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
        }));
    }
};
ResponseInterceptor = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Reflector])
], ResponseInterceptor);
export { ResponseInterceptor };
//# sourceMappingURL=response.interceptor.js.map