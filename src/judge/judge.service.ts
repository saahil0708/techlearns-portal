import { Injectable, Logger } from '@nestjs/common';
import {
  ProgrammingLanguage,
  SubmissionStatus,
  SubmissionVerdict,
} from '@prisma/client';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { PrismaService } from '../prisma/prisma.service.js';

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

  constructor(private prisma: PrismaService) {}

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
    for (const testCase of testCases) {
      const startedAt = Date.now();
      const execution = await this.executeInSandbox(
        sourceCode,
        language,
        testCase.input,
        timeLimit,
        memoryLimit,
      );
      const runtime = Date.now() - startedAt;
      maxRuntime = Math.max(maxRuntime, runtime);

      if (execution.timedOut) {
        return {
          verdict: SubmissionVerdict.TIME_LIMIT_EXCEEDED,
          runtime,
          memory: execution.memory,
          passedTestCases,
          totalTestCases: testCases.length,
          errorMessage: 'Execution exceeded the problem time limit',
        };
      }
      if (execution.memoryLimitExceeded) {
        return {
          verdict: SubmissionVerdict.MEMORY_LIMIT_EXCEEDED,
          runtime,
          memory: execution.memory,
          passedTestCases,
          totalTestCases: testCases.length,
          errorMessage: 'Execution exceeded the problem memory limit',
        };
      }
      if (execution.compilationError) {
        return {
          verdict: SubmissionVerdict.COMPILATION_ERROR,
          runtime,
          memory: execution.memory,
          passedTestCases,
          totalTestCases: testCases.length,
          errorMessage: execution.compilationError,
        };
      }
      if (execution.systemError) {
        return {
          verdict: SubmissionVerdict.SYSTEM_ERROR,
          runtime,
          memory: execution.memory,
          passedTestCases,
          totalTestCases: testCases.length,
          errorMessage: execution.systemError,
        };
      }
      if (execution.runtimeError) {
        return {
          verdict: SubmissionVerdict.RUNTIME_ERROR,
          runtime,
          memory: execution.memory,
          passedTestCases,
          totalTestCases: testCases.length,
          errorMessage: execution.runtimeError,
        };
      }
      if (this.normalizeOutput(execution.output || '') !== this.normalizeOutput(testCase.expectedOutput || '')) {
        return {
          verdict: SubmissionVerdict.WRONG_ANSWER,
          runtime: maxRuntime,
          memory: execution.memory,
          passedTestCases,
          totalTestCases: testCases.length,
          errorMessage: `Test case failed at input: ${testCase.input.slice(0, 50)}`,
        };
      }
      passedTestCases++;
    }

    return {
      verdict: SubmissionVerdict.ACCEPTED,
      runtime: Math.max(maxRuntime, 1),
      memory: 0,
      passedTestCases,
      totalTestCases: testCases.length,
    };
  }

  private normalizeOutput(output: string): string {
    return output.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').map((line) => line.trimEnd()).join('\n').trim();
  }

  private async executeInSandbox(
    sourceCode: string,
    language: ProgrammingLanguage,
    input: string,
    timeLimitMs: number,
    memoryLimitMb: number,
  ): Promise<{ output?: string; compilationError?: string; runtimeError?: string; systemError?: string; timedOut?: boolean; memoryLimitExceeded?: boolean; memory: number }> {
    const extensions: Record<ProgrammingLanguage, string> = {
      [ProgrammingLanguage.PYTHON]: 'py',
      [ProgrammingLanguage.JAVASCRIPT]: 'mjs',
      [ProgrammingLanguage.C]: 'c',
      [ProgrammingLanguage.CPP]: 'cpp',
      [ProgrammingLanguage.JAVA]: 'java',
    };
    const image = process.env.JUDGE_IMAGE;
    if (!image) {
      return {
        systemError: 'JUDGE_IMAGE is not configured; isolated submission execution is unavailable',
        memory: 0,
      };
    }
    const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeplatform-judge-'));
    const sourcePath = path.join(workDir, `solution.${extensions[language]}`);
    const containerName = `codeplatform-judge-${randomUUID()}`;
    const args = [
      'run', '--rm', '--name', containerName, '--network', 'none', '--read-only',
      '--tmpfs', '/tmp:rw,size=64m', '--memory', `${Math.max(16, memoryLimitMb)}m`,
      '--memory-swap', `${Math.max(16, memoryLimitMb)}m`,
      '--cpus', '1', '--pids-limit', '64', '--cap-drop', 'ALL',
      '--security-opt', 'no-new-privileges', '--user', '1000:1000',
      '-v', `${sourcePath}:/workspace/${language === ProgrammingLanguage.JAVA ? 'Solution.java' : `solution.${extensions[language]}`}:ro`,
      image, language,
    ];

    try {
      await fs.writeFile(sourcePath, sourceCode, 'utf8');
      return await new Promise((resolve) => {
        const child = spawn('docker', args, { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
        let output = '';
        let error = '';
        let timedOut = false;
        const maxOutput = 512 * 1024;
        const timer = setTimeout(() => {
          timedOut = true;
          child.kill('SIGKILL');
          spawn('docker', ['rm', '-f', containerName], { windowsHide: true, stdio: 'ignore' });
        }, Math.max(100, timeLimitMs));
        child.stdout.on('data', (chunk: Buffer) => {
          output += chunk.toString();
          if (Buffer.byteLength(output) > maxOutput) child.kill('SIGKILL');
        });
        child.stderr.on('data', (chunk: Buffer) => {
          error += chunk.toString();
          if (Buffer.byteLength(error) > maxOutput) child.kill('SIGKILL');
        });
        child.on('error', (spawnError: Error) => {
          clearTimeout(timer);
          resolve({ systemError: `Judge container unavailable: ${spawnError.message}`, memory: 0 });
        });
        child.on('close', (exitCode) => {
          clearTimeout(timer);
          if (timedOut) {
            resolve({ timedOut: true, memory: memoryLimitMb });
          } else if (exitCode === 0) {
            resolve({ output, memory: memoryLimitMb });
          } else if (exitCode === 137) {
            resolve({ memoryLimitExceeded: !timedOut, memory: memoryLimitMb });
          } else if (exitCode === 2) {
            resolve({ compilationError: error.trim() || 'Compilation failed', memory: memoryLimitMb });
          } else {
            resolve({ runtimeError: error.trim() || 'Program exited with a non-zero status', memory: memoryLimitMb });
          }
        });
        child.stdin.on('error', () => {});
        child.stdin.end(input || '');
      });
    } finally {
      await fs.rm(workDir, { recursive: true, force: true });
    }
  }
}
