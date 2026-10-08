import { Global, Module } from '@nestjs/common';
import { JudgeQueueService } from './judge-queue.service.js';

@Global()
@Module({
  providers: [JudgeQueueService],
  exports: [JudgeQueueService],
})
export class JudgeQueueModule {}
