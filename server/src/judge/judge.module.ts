import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { JudgeService } from './judge.service.js';
import { JudgeWorkerService } from './judge-worker.service.js';
import { PlagiarismService } from './plagiarism.service.js';
import { DockerSandboxProvider } from './sandbox/docker-sandbox.provider.js';
import { FallbackSandboxProvider } from './sandbox/fallback-sandbox.provider.js';

@Module({
  imports: [PrismaModule],
  providers: [
    JudgeService,
    JudgeWorkerService,
    PlagiarismService,
    DockerSandboxProvider,
    FallbackSandboxProvider,
  ],
  exports: [
    JudgeService,
    JudgeWorkerService,
    PlagiarismService,
    DockerSandboxProvider,
    FallbackSandboxProvider,
  ],
})
export class JudgeModule {}
