import { Module } from '@nestjs/common';
import { PotdService } from './potd.service.js';
import { ProblemsController } from './problems.controller.js';
import { ProblemsResolver } from './problems.resolver.js';
import { ProblemsService } from './problems.service.js';

@Module({
  controllers: [ProblemsController],
  providers: [ProblemsService, PotdService, ProblemsResolver],
  exports: [ProblemsService, PotdService],
})
export class ProblemsModule {}

