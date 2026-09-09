import { Module } from '@nestjs/common';
import { SubmissionsResolver } from './submissions.resolver.js';
import { SubmissionsService } from './submissions.service.js';

@Module({
  providers: [SubmissionsService, SubmissionsResolver],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
