import { Injectable, Logger, Optional } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ProgrammingLanguage,
  SubmissionStatus,
  SubmissionVerdict,
} from '@prisma/client';
import { AppEvents, SubmissionEvaluatedEvent } from '../common/events/app-events.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { DockerSandboxProvider } from './sandbox/docker-sandbox.provider.js';
import { FallbackSandboxProvider } from './sandbox/fallback-sandbox.provider.js';
import { ISandboxProvider } from './sandbox/sandbox.interface.js';

export interface EvaluationResult {
  verdict: SubmissionVerdict;
  runtime: number;
  memory: number;
  passedTestCases: number;
  totalTestCases: number;
  errorMessage?: string;
}

@Injectable()
export class JudgeService {
  private readonly logger = new Logger(JudgeService.name);
  private sandboxProvider: ISandboxProvider;

  constructor(
    private prisma: PrismaService,
    @Optional() private dockerSandbox?: DockerSandboxProvider,
    @Optional() private fallbackSandbox?: FallbackSandboxProvider,
    @Optional() private eventEmitter?: EventEmitter2,
  ) {
    this.dockerSandbox = this.dockerSandbox || new DockerSandboxProvider();
    this.fallbackSandbox = this.fallbackSandbox || new FallbackSandboxProvider();
    this.sandboxProvider = this.dockerSandbox;
  }

  /**
   * Pluggable sandbox provider switcher (supports local, docker, or remote serverless runners)
   */
  public setSandboxProvider(provider: ISandboxProvider) {
    this.sandboxProvider = provider;
  }

  async evaluateSubmission(submissionId: string): Promise<void> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        problem: {
          include: {
            testCases: { orderBy: { order: 'asc' } },
          },
        },
      },
    });

    if (!submission) {
      this.logger.error(`Submission ${submissionId} not found for evaluation`);
      return;
    }

    await this.prisma.submission.update({
      where: { id: submissionId },
      data: { status: SubmissionStatus.PROCESSING },
    });

    try {
      const result = await this.runTestCases(
        submission.sourceCode,
        submission.language,
        submission.problem.testCases,
        submission.problem.timeLimit,
        submission.problem.memoryLimit,
      );

      await this.prisma.submission.update({
        where: { id: submissionId },
        data: {
          status:
            result.verdict === SubmissionVerdict.SYSTEM_ERROR
              ? SubmissionStatus.FAILED
              : SubmissionStatus.COMPLETED,
          verdict: result.verdict,
          runtime: result.runtime,
          memory: result.memory,
          passedTestCases: result.passedTestCases,
          totalTestCases: result.totalTestCases,
          errorMessage: result.errorMessage,
        },
      });

      this.logger.log(
        `Submission ${submissionId} evaluated: verdict=${result.verdict}, passed=${result.passedTestCases}/${result.totalTestCases}`,
      );

      // Decoupled asynchronous domain event emission
      if (this.eventEmitter) {
        this.eventEmitter.emit(
          AppEvents.SUBMISSION_EVALUATED,
          new SubmissionEvaluatedEvent(
            submission.id,
            submission.userId,
            submission.problemId,
            result.verdict,
            result.passedTestCases,
            result.totalTestCases,
            submission.contestId,
          ),
        );
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Internal evaluation failure';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error evaluating submission ${submissionId}: ${message}`, stack);

      await this.prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: SubmissionStatus.FAILED,
          verdict: SubmissionVerdict.SYSTEM_ERROR,
          errorMessage: message,
        },
      });
    }
  }

  private async executeInSandbox(
    sourceCode: string,
    language: ProgrammingLanguage,
    input: string,
    timeLimitMs: number,
    memoryLimitMb: number,
  ) {
    return this.sandboxProvider.execute(sourceCode, language, input, {
      timeLimitMs,
      memoryLimitMb,
    });
  }

  private async runTestCases(
    sourceCode: string,
    language: ProgrammingLanguage,
    testCases: Array<{ id: string; input: string; expectedOutput: string }>,
    timeLimit: number,
    memoryLimit: number,
  ): Promise<EvaluationResult> {
    if (testCases.length === 0) {
      return {
        verdict: SubmissionVerdict.SYSTEM_ERROR,
        runtime: 0,
        memory: 0,
        passedTestCases: 0,
        totalTestCases: 0,
        errorMessage: 'No test cases configured for problem',
      };
    }

    let passedTestCases = 0;
    let maxRuntime = 0;
    let maxMemory = 0;
    for (const testCase of testCases) {
      const startedAt = Date.now();
      const execution = await this.executeInSandbox(
        sourceCode,
        language,
        testCase.input,
        timeLimit,
        memoryLimit,
      );
      const runtime = execution.executionTimeMs !== undefined ? execution.executionTimeMs : (Date.now() - startedAt);
      maxRuntime = Math.max(maxRuntime, runtime);
      if (execution.memory !== undefined && execution.memory > 0) {
        maxMemory = Math.max(maxMemory, execution.memory);
      }

      if (execution.timedOut) {
        return {
          verdict: SubmissionVerdict.TIME_LIMIT_EXCEEDED,
          runtime: maxRuntime,
          memory: maxMemory || execution.memory || 0,
          passedTestCases,
          totalTestCases: testCases.length,
          errorMessage: `Time Limit Exceeded: Execution exceeded ${timeLimit}ms budget`,
        };
      }
      if (execution.memoryLimitExceeded) {
        return {
          verdict: SubmissionVerdict.MEMORY_LIMIT_EXCEEDED,
          runtime: maxRuntime,
          memory: maxMemory || memoryLimit,
          passedTestCases,
          totalTestCases: testCases.length,
          errorMessage: `Memory Limit Exceeded: Process exceeded ${memoryLimit}MB budget`,
        };
      }
      if (execution.outputLimitExceeded) {
        return {
          verdict: SubmissionVerdict.RUNTIME_ERROR,
          runtime: maxRuntime,
          memory: maxMemory || execution.memory || 0,
          passedTestCases,
          totalTestCases: testCases.length,
          errorMessage: execution.runtimeError || 'Output Limit Exceeded (exceeded 512KB stdout buffer)',
        };
      }
      if (execution.compilationError) {
        return {
          verdict: SubmissionVerdict.COMPILATION_ERROR,
          runtime: maxRuntime,
          memory: maxMemory || execution.memory || 0,
          passedTestCases,
          totalTestCases: testCases.length,
          errorMessage: execution.compilationError,
        };
      }
      if (execution.systemError) {
        return {
          verdict: SubmissionVerdict.SYSTEM_ERROR,
          runtime: maxRuntime,
          memory: maxMemory || execution.memory || 0,
          passedTestCases,
          totalTestCases: testCases.length,
          errorMessage: execution.systemError,
        };
      }
      if (execution.runtimeError) {
        return {
          verdict: SubmissionVerdict.RUNTIME_ERROR,
          runtime: maxRuntime,
          memory: maxMemory || execution.memory || 0,
          passedTestCases,
          totalTestCases: testCases.length,
          errorMessage: execution.runtimeError,
        };
      }
      if (this.normalizeOutput(execution.output || '') !== this.normalizeOutput(testCase.expectedOutput || '')) {
        return {
          verdict: SubmissionVerdict.WRONG_ANSWER,
          runtime: maxRuntime,
          memory: maxMemory || execution.memory || 0,
          passedTestCases,
          totalTestCases: testCases.length,
          errorMessage: `Wrong Answer on Test Case #${passedTestCases + 1}`,
        };
      }
      passedTestCases++;
    }

    return {
      verdict: SubmissionVerdict.ACCEPTED,
      runtime: Math.max(maxRuntime, 1),
      memory: maxMemory || 0,
      passedTestCases,
      totalTestCases: testCases.length,
    };
  }

  private normalizeOutput(output: string): string {
    return output.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').map((line) => line.trimEnd()).join('\n').trim();
  }
}
