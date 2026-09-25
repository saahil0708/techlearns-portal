import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { InterviewPrepController } from './interview-prep.controller.js';
import { InterviewPrepService } from './interview-prep.service.js';
import { InterviewPrepResolver } from './interview-prep.resolver.js';

@Module({
  imports: [PrismaModule],
  controllers: [InterviewPrepController],
  providers: [InterviewPrepService, InterviewPrepResolver],
  exports: [InterviewPrepService],
})
export class InterviewPrepModule {}
