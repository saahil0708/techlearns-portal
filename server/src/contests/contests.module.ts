import { Module } from '@nestjs/common';
import { JudgeModule } from '../judge/judge.module.js';
import { ComparativeLeaderboardService } from './comparative-leaderboard.service.js';
import { ContestsController } from './contests.controller.js';
import { ContestsResolver } from './contests.resolver.js';
import { ContestsService } from './contests.service.js';

@Module({
  imports: [JudgeModule],
  controllers: [ContestsController],
  providers: [ContestsService, ComparativeLeaderboardService, ContestsResolver],
  exports: [ContestsService, ComparativeLeaderboardService],
})
export class ContestsModule {}


