import { Injectable, Logger } from '@nestjs/common';
import { ProgrammingLanguage } from '@prisma/client';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  ISandboxProvider,
  SandboxExecutionLimits,
  SandboxExecutionResult,
} from './sandbox.interface.js';

@Injectable()
export class DockerSandboxProvider implements ISandboxProvider {
  readonly name = 'docker-sandbox';
  private readonly logger = new Logger(DockerSandboxProvider.name);

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.JUDGE_IMAGE);
  }

  async execute(
    sourceCode: string,
    language: ProgrammingLanguage,
    input: string,
    limits: SandboxExecutionLimits,
  ): Promise<SandboxExecutionResult> {
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
      'run', '-i', '--rm', '--name', containerName, '--network', 'none', '--read-only',
      '--tmpfs', '/tmp:rw,size=64m', '--memory', `${Math.max(16, limits.memoryLimitMb)}m`,
      '--memory-swap', `${Math.max(16, limits.memoryLimitMb)}m`,
      '--cpus', '1', '--pids-limit', '64', '--cap-drop', 'ALL',
      '--security-opt', 'no-new-privileges', '--user', '1000:1000',
      '-v', `${sourcePath.replace(/\\/g, '/')}:/workspace/${language === ProgrammingLanguage.JAVA ? 'Solution.java' : `solution.${extensions[language]}`}:ro`,
      image, language,
    ];

    try {
      await fs.writeFile(sourcePath, sourceCode, 'utf8');
      return await new Promise((resolve) => {
        const child = spawn('docker', args, { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
        let output = '';
        let error = '';
        let timedOut = false;
        let outputLimitExceeded = false;
        let isTerminated = false;
        const maxOutput = 512 * 1024;

        const terminateContainer = (reason: 'timeout' | 'output_overflow') => {
          if (isTerminated) return;
          isTerminated = true;
          if (reason === 'timeout') timedOut = true;
          if (reason === 'output_overflow') outputLimitExceeded = true;
          try {
            child.kill('SIGKILL');
          } catch {}
          spawn('docker', ['rm', '-f', containerName], { windowsHide: true, stdio: 'ignore' });
        };

        const timer = setTimeout(() => {
          terminateContainer('timeout');
        }, Math.max(4000, limits.timeLimitMs + 5000));

        child.stdout.on('data', (chunk: Buffer) => {
          output += chunk.toString();
          if (Buffer.byteLength(output) > maxOutput) {
            terminateContainer('output_overflow');
          }
        });

        child.stderr.on('data', (chunk: Buffer) => {
          error += chunk.toString();
          if (Buffer.byteLength(error) > maxOutput) {
            terminateContainer('output_overflow');
          }
        });

        child.on('error', (spawnError: Error) => {
          clearTimeout(timer);
          resolve({ systemError: `Judge container unavailable: ${spawnError.message}`, memory: 0 });
        });

        child.on('close', (exitCode) => {
          clearTimeout(timer);
          if (timedOut) {
            resolve({ timedOut: true, memory: limits.memoryLimitMb });
          } else if (outputLimitExceeded) {
            resolve({
              outputLimitExceeded: true,
              runtimeError: 'Output limit exceeded (exceeded maximum output buffer of 512KB)',
              memory: limits.memoryLimitMb,
            });
          } else if (exitCode === 0) {
            resolve({ output, memory: limits.memoryLimitMb });
          } else if (exitCode === 137) {
            resolve({ memoryLimitExceeded: !timedOut, memory: limits.memoryLimitMb });
          } else if (exitCode === 2) {
            resolve({ compilationError: error.trim() || 'Compilation failed', memory: limits.memoryLimitMb });
          } else {
            resolve({ runtimeError: error.trim() || 'Program exited with a non-zero status', memory: limits.memoryLimitMb });
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
