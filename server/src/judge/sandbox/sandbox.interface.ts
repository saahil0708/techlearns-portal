import { ProgrammingLanguage } from '@prisma/client';

export interface SandboxExecutionLimits {
  timeLimitMs: number;
  memoryLimitMb: number;
}

export interface SandboxExecutionResult {
  output?: string;
  compilationError?: string;
  runtimeError?: string;
  systemError?: string;
  timedOut?: boolean;
  memoryLimitExceeded?: boolean;
  outputLimitExceeded?: boolean;
  memory: number;
}

export interface ISandboxProvider {
  readonly name: string;
  isAvailable(): Promise<boolean>;
  execute(
    sourceCode: string,
    language: ProgrammingLanguage,
    input: string,
    limits: SandboxExecutionLimits,
  ): Promise<SandboxExecutionResult>;
}
