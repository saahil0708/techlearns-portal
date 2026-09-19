var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';
let GqlThrottlerGuard = class GqlThrottlerGuard extends ThrottlerGuard {
    getRequestResponse(context) {
        if (context.getType() === 'graphql') {
            const gqlContext = GqlExecutionContext.create(context).getContext();
            return { req: gqlContext.req, res: gqlContext.res };
        }
        return super.getRequestResponse(context);
    }
};
GqlThrottlerGuard = __decorate([
    Injectable()
], GqlThrottlerGuard);
export { GqlThrottlerGuard };
//# sourceMappingURL=throttler.guard.js.map