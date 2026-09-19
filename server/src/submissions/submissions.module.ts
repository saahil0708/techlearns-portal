import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { JUDGE_QUEUE_NAME } from '../judge/judge.constants.js';
import { SubmissionsResolver } from './submissions.resolver.js';
import { SubmissionsService } from './submissions.service.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: JUDGE_QUEUE_NAME,
    }),
  ],
  providers: [SubmissionsService, SubmissionsResolver],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}

