import { Module } from '@nestjs/common';
import { BatchesController } from './batches.controller.js';
import { BatchesResolver } from './batches.resolver.js';
import { BatchesService } from './batches.service.js';
import { BatchAccessGuard } from '../common/guards/batch-access.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [BatchesController],
  providers: [BatchesService, BatchesResolver, BatchAccessGuard, PrismaService],
  exports: [BatchesService],
})
export class BatchesModule {}
