import { Module } from '@nestjs/common';
import { ContestsResolver } from './contests.resolver.js';
import { ContestsService } from './contests.service.js';

@Module({
  providers: [ContestsService, ContestsResolver],
  exports: [ContestsService],
})
export class ContestsModule {}
