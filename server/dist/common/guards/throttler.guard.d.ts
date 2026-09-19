import { ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
export declare class GqlThrottlerGuard extends ThrottlerGuard {
    protected getRequestResponse(context: ExecutionContext): {
        req: Record<string, any>;
        res: Record<string, any>;
    };
}
