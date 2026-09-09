import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver.js';
import { UsersService } from './users.service.js';

@Module({
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
