import { Injectable, Logger } from '@nestjs/common';
import { ProgrammingLanguage } from '@prisma/client';
import {
  ISandboxProvider,
  SandboxExecutionLimits,
  SandboxExecutionResult,
} from './sandbox.interface.js';

@Injectable()
export class FallbackSandboxProvider implements ISandboxProvider {
  readonly name = 'fallback-sandbox';
  private readonly logger = new Logger(FallbackSandboxProvider.name);

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async execute(
    _sourceCode: string,
    _language: ProgrammingLanguage,
    _input: string,
    limits: SandboxExecutionLimits,
  ): Promise<SandboxExecutionResult> {
    this.logger.warn('Executing with FallbackSandboxProvider (mock sandbox for development/testing)');
    return {
      output: '',
      memory: limits.memoryLimitMb,
    };
  }
}
