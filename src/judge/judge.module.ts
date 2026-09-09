// import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
// import { JUDGE_QUEUE_NAME } from './judge.constants.js';
import { JudgeService } from './judge.service.js';
// import { JudgeProcessor } from './processors/judge.processor.js';

@Module({
  imports: [
    PrismaModule,
    // BullModule.registerQueue({
    //   name: JUDGE_QUEUE_NAME,
    //   defaultJobOptions: {
    //     attempts: 3,
    //     backoff: {
    //       type: 'exponential',
    //       delay: 2000,
    //     },
    //     removeOnComplete: 100,
    //     removeOnFail: 500,
    //   },
    // }),
  ],
  providers: [
    JudgeService,
    // JudgeProcessor,
  ],
  exports: [
    JudgeService,
    // BullModule,
  ],
})
export class JudgeModule {}
