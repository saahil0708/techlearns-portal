import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AICoachController } from './ai-coach.controller.js';
import { AICoachService } from './ai-coach.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [AICoachController],
  providers: [AICoachService],
  exports: [AICoachService],
})
export class AICoachModule {}
