import { Global, Module } from '@nestjs/common';
import { AppCacheService } from './app-cache.service.js';

@Global()
@Module({
  providers: [AppCacheService],
  exports: [AppCacheService],
})
export class AppCacheModule {}
