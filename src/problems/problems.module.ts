import { Module } from '@nestjs/common';
import { ProblemsResolver } from './problems.resolver.js';
import { ProblemsService } from './problems.service.js';

@Module({
  providers: [ProblemsService, ProblemsResolver],
  exports: [ProblemsService],
})
export class ProblemsModule {}
