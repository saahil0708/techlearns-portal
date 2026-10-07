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
    const isCompiled = language === ProgrammingLanguage.JAVA || language === ProgrammingLanguage.CPP || language === ProgrammingLanguage.C;
    // Bounded allowance for Docker container creation, image loading, and language compilation (configurable via JUDGE_SETUP_TIMEOUT_MS / JUDGE_COMPILED_SETUP_TIMEOUT_MS)
    const envSetupTimeout = parseInt(process.env.JUDGE_SETUP_TIMEOUT_MS || '', 10);
    const envCompiledTimeout = parseInt(process.env.JUDGE_COMPILED_SETUP_TIMEOUT_MS || '', 10);
    const validSetupTimeout = Number.isFinite(envSetupTimeout) && envSetupTimeout > 0 ? envSetupTimeout : null;
    const validCompiledTimeout = Number.isFinite(envCompiledTimeout) && envCompiledTimeout > 0 ? envCompiledTimeout : null;
    const setupTimeoutMs = isCompiled
      ? (validCompiledTimeout ?? validSetupTimeout ?? 10000)
      : (validSetupTimeout ?? 5000);
    const cpuLimitSeconds = Math.max(5, Math.ceil((limits.timeLimitMs + setupTimeoutMs) / 1000) + 2);
    const containerName = `codeplatform-judge-${randomUUID()}`;
    const args = [
      'run', '-i', '--rm', '--name', containerName, '--network', 'none', '--read-only',
      '--tmpfs', '/tmp:rw,size=32m',
      '--memory', `${Math.max(16, limits.memoryLimitMb)}m`,
      '--memory-swap', `${Math.max(16, limits.memoryLimitMb)}m`,
      '--cpus', '1',
      '--pids-limit', '32',
      '--ulimit', `cpu=${cpuLimitSeconds}:${cpuLimitSeconds}`,
      '--ulimit', 'fsize=10485760:10485760',
      '--cap-drop', 'ALL',
      '--security-opt', 'no-new-privileges',
      '--user', '1000:1000',
      '-v', `${sourcePath.replace(/\\/g, '/')}:/workspace/${language === ProgrammingLanguage.JAVA ? 'Solution.java' : `solution.${extensions[language]}`}:ro`,
      image, language,
    ];

    let effectiveSourceCode = sourceCode;
    if (language === ProgrammingLanguage.PYTHON) {
      const hasTopLevelDriver = /^(print\s*\(|if\s+__name__\s*==|\w+\s*=\s*sys\.stdin|\w+\s*=\s*input\()/m.test(sourceCode);
      if (!hasTopLevelDriver) {
        effectiveSourceCode += `

# --- Auto-Injected Test Harness ---
if __name__ == '__main__':
    import sys
    _raw_in = sys.stdin.read().strip()
    if _raw_in:
        _func = None
        if 'Solution' in globals():
            _inst = globals()['Solution']()
            for _name in dir(_inst):
                if not _name.startswith('_') and callable(getattr(_inst, _name)):
                    _func = getattr(_inst, _name)
                    break
        elif 'solve' in globals() and callable(globals()['solve']):
            _func = globals()['solve']
        elif 'twoSum' in globals() and callable(globals()['twoSum']):
            _func = globals()['twoSum']

        if _func:
            _tokens = _raw_in.split()
            if len(_tokens) > 1 and _tokens[0].isdigit() and int(_tokens[0]) == len(_tokens) - 1:
                _nums = [int(x) if (x.lstrip('-').isdigit()) else x for x in _tokens[1:]]
                try:
                    _res = _func(_nums)
                except TypeError:
                    _res = _func(int(_tokens[0]), _nums)
            else:
                _nums = [int(x) if (x.lstrip('-').isdigit()) else x for x in _tokens]
                try:
                    _res = _func(_nums)
                except TypeError:
                    _res = _func(*_nums)

            if _res is not None:
                if isinstance(_res, (list, tuple)):
                    print(' '.join(map(str, _res)))
                else:
                    print(_res)
`;
      }
    }

    try {
      await fs.writeFile(sourcePath, effectiveSourceCode, { encoding: 'utf8', mode: 0o644 });
      return await new Promise((resolve) => {
        const child = spawn('docker', args, { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
        let output = '';
        let error = '';
        let timedOut = false;
        let setupTimedOut = false;
        let outputLimitExceeded = false;
        let isTerminated = false;
        let executionTimer: NodeJS.Timeout | null = null;
        let setupTimer: NodeJS.Timeout | null = null;
        let watchdogStarted = false;
        let executionStartTime: number | null = null;
        let stdoutControlBuf = '';
        let stderrControlBuf = '';
        const maxOutput = 512 * 1024;

        const clearAllTimers = () => {
          if (setupTimer) {
            clearTimeout(setupTimer);
            setupTimer = null;
          }
          if (executionTimer) {
            clearTimeout(executionTimer);
            executionTimer = null;
          }
        };

        const terminateContainer = (reason: 'timeout' | 'setup_timeout' | 'output_overflow') => {
          if (isTerminated) return;
          isTerminated = true;
          clearAllTimers();
          if (reason === 'setup_timeout') setupTimedOut = true;
          if (reason === 'timeout') timedOut = true;
          if (reason === 'output_overflow') outputLimitExceeded = true;
          try {
            child.kill('SIGKILL');
          } catch {}
          spawn('docker', ['rm', '-f', containerName], { windowsHide: true, stdio: 'ignore' });
        };

        // Start execution timer once setup completes, guaranteeing full limits.timeLimitMs budget for user code
        const startExecutionWatchdog = () => {
          if (watchdogStarted || isTerminated) return;
          watchdogStarted = true;
          executionStartTime = Date.now();
          if (setupTimer) {
            clearTimeout(setupTimer);
            setupTimer = null;
          }
          executionTimer = setTimeout(() => {
            terminateContainer('timeout');
          }, limits.timeLimitMs);
        };

        // Bounded setup timer guarding container creation, image loading, compilation, and fallback execution
        setupTimer = setTimeout(() => {
          terminateContainer('setup_timeout');
        }, setupTimeoutMs + limits.timeLimitMs);

        const EXEC_START_SIGNAL = '__CODEPLATFORM_EXEC_START__';

        const processStreamChunk = (
          chunk: string | Buffer,
          isStderr: boolean,
        ) => {
          const text = typeof chunk === 'string' ? chunk : chunk.toString('utf8');
          if (!watchdogStarted) {
            if (isStderr) {
              stderrControlBuf += text;
            } else {
              stdoutControlBuf += text;
            }

            const stdoutIdx = stdoutControlBuf.indexOf(EXEC_START_SIGNAL);
            const stderrIdx = stderrControlBuf.indexOf(EXEC_START_SIGNAL);

            if (stdoutIdx !== -1 || stderrIdx !== -1) {
              startExecutionWatchdog();

              if (stdoutIdx !== -1) {
                const before = stdoutControlBuf.slice(0, stdoutIdx);
                const after = stdoutControlBuf.slice(stdoutIdx + EXEC_START_SIGNAL.length).replace(/^\r?\n/, '');
                output += before + after;
              } else {
                output += stdoutControlBuf;
              }
              stdoutControlBuf = '';

              if (stderrIdx !== -1) {
                const before = stderrControlBuf.slice(0, stderrIdx);
                const after = stderrControlBuf.slice(stderrIdx + EXEC_START_SIGNAL.length).replace(/^\r?\n/, '');
                error += before + after;
              } else {
                error += stderrControlBuf;
              }
              stderrControlBuf = '';
            }
          } else {
            if (isStderr) {
              error += text;
            } else {
              output += text;
            }
          }

          if (
            Buffer.byteLength(output) + Buffer.byteLength(stdoutControlBuf) > maxOutput ||
            Buffer.byteLength(error) + Buffer.byteLength(stderrControlBuf) > maxOutput
          ) {
            terminateContainer('output_overflow');
          }
        };

        child.stdout.setEncoding('utf8');
        child.stderr.setEncoding('utf8');

        child.stdout.on('data', (chunk: string | Buffer) => {
          processStreamChunk(chunk, false);
        });

        child.stderr.on('data', (chunk: string | Buffer) => {
          processStreamChunk(chunk, true);
        });

        child.on('error', (spawnError: Error) => {
          clearAllTimers();
          resolve({ systemError: `Judge container unavailable: ${spawnError.message}`, memory: undefined, executionTimeMs: undefined });
        });

        child.on('close', (exitCode) => {
          clearAllTimers();
          if (!watchdogStarted) {
            output += stdoutControlBuf;
            error += stderrControlBuf;
          }
          const executionTimeMs = executionStartTime
            ? Math.max(1, Date.now() - executionStartTime)
            : undefined;

          if (timedOut || (setupTimedOut && watchdogStarted)) {
            resolve({ timedOut: true, memory: limits.memoryLimitMb, executionTimeMs: executionTimeMs ?? limits.timeLimitMs });
          } else if (setupTimedOut) {
            resolve({ systemError: 'Sandbox initialization timed out during container setup or compilation', memory: undefined, executionTimeMs: undefined });
          } else if (outputLimitExceeded) {
            resolve({
              outputLimitExceeded: true,
              runtimeError: 'Output limit exceeded (exceeded maximum output buffer of 512KB)',
              memory: undefined,
              executionTimeMs,
            });
          } else if (exitCode === 0) {
            resolve({ output, memory: undefined, executionTimeMs });
          } else if (exitCode === 137) {
            resolve({ memoryLimitExceeded: !timedOut, memory: limits.memoryLimitMb, executionTimeMs });
          } else if (exitCode === 2) {
            resolve({ compilationError: error.trim() || 'Compilation failed', memory: undefined, executionTimeMs: undefined });
          } else {
            resolve({ runtimeError: error.trim() || 'Program exited with a non-zero status', memory: undefined, executionTimeMs });
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
