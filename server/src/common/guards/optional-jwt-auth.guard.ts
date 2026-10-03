import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  override handleRequest<TUser = any>(_err: any, user: any): TUser {
    return user || undefined;
  }
}
