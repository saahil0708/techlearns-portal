import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class InstitutionAccessGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
