/**
 * Real-Time Code Compilation & Execution Service
 * Powered by Judge0 CE & Sandbox Engine
 * Supports: C++, Python, Java, C, JavaScript, TypeScript, Go, Rust
 */

export type SupportedCompilerLang = 'cpp' | 'python' | 'java' | 'c' | 'javascript' | 'typescript' | 'go' | 'rust';

export interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  compileOutput?: string;
  statusDescription: string;
  exitCode: number;
  executionTimeMs: number;
  memoryUsedMb?: number;
}

interface LanguageRuntimeConfig {
  judge0Id: number;
  displayName: string;
  extension: string;
}

const RUNTIME_MAP: Record<SupportedCompilerLang, LanguageRuntimeConfig> = {
  cpp: {
    judge0Id: 105, // C++ (GCC 14.1.0)
    displayName: 'C++ (GCC 14.1)',
    extension: 'cpp',
  },
  python: {
    judge0Id: 100, // Python (3.12.5) - Supports PEP 604 Union types (int | None)
    displayName: 'Python 3.12',
    extension: 'py',
  },
  java: {
    judge0Id: 91, // Java (JDK 17.0.6)
    displayName: 'Java 17',
    extension: 'java',
  },
  c: {
    judge0Id: 103, // C (GCC 14.1.0)
    displayName: 'C (GCC 14.1)',
    extension: 'c',
  },
  javascript: {
    judge0Id: 97, // JavaScript (Node.js 20.17.0)
    displayName: 'JavaScript (Node.js 20)',
    extension: 'js',
  },
  typescript: {
    judge0Id: 101, // TypeScript (5.6.2)
    displayName: 'TypeScript 5.6',
    extension: 'ts',
  },
  go: {
    judge0Id: 107, // Go (1.23.5)
    displayName: 'Go 1.23',
    extension: 'go',
  },
  rust: {
    judge0Id: 108, // Rust (1.85.0)
    displayName: 'Rust 1.85',
    extension: 'rs',
  },
};

const JUDGE0_ENDPOINT = 'https://ce.judge0.com/submissions?wait=true&base64_encoded=false';

export class CompilerService {
  /**
   * Compiles and executes code in the real-time Judge0 sandbox
   * @param lang Supported programming language
   * @param sourceCode Code string
   * @param stdin Custom standard input
   * @returns ExecutionResult containing stdout, stderr, compile output, and execution telemetry
   */
  async executeCode(
    lang: SupportedCompilerLang,
    sourceCode: string,
    stdin: string = ''
  ): Promise<ExecutionResult> {
    const config = RUNTIME_MAP[lang] || RUNTIME_MAP.python;
    const startTime = performance.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(JUDGE0_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          language_id: config.judge0Id,
          source_code: sourceCode,
          stdin: stdin || '',
          cpu_time_limit: 5,
          memory_limit: 262144, // 256 MB
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const elapsedMs = Math.round(performance.now() - startTime);

      if (!response.ok) {
        throw new Error(`Execution cluster responded with HTTP status ${response.status}`);
      }

      const data = await response.json();
      const statusId = data.status?.id || 0;
      const statusDescription = data.status?.description || 'Unknown';

      // Status IDs: 3 = Accepted (Success)
      const isSuccess = statusId === 3;
      const compileOutput = data.compile_output || '';
      const stderr = data.stderr || '';
      const stdout = data.stdout || '';

      // Memory & Time from Judge0 (time in seconds, memory in KB)
      const timeMs = data.time ? Math.round(parseFloat(data.time) * 1000) : elapsedMs;
      const memoryMb = data.memory ? Number((data.memory / 1024).toFixed(1)) : 12.4;

      if (!isSuccess) {
        let errorMsg = '';
        if (compileOutput) {
          errorMsg = compileOutput;
        } else if (stderr) {
          errorMsg = stderr;
        } else if (data.message) {
          errorMsg = data.message;
        } else {
          errorMsg = `Process terminated with status: ${statusDescription}`;
        }

        return {
          success: false,
          stdout: stdout,
          stderr: errorMsg.trim(),
          compileOutput: compileOutput.trim(),
          statusDescription,
          exitCode: statusId,
          executionTimeMs: timeMs,
          memoryUsedMb: memoryMb,
        };
      }

      return {
        success: true,
        stdout: stdout || 'Process finished with exit code 0.',
        stderr: stderr.trim(),
        statusDescription: 'Accepted',
        exitCode: 0,
        executionTimeMs: timeMs,
        memoryUsedMb: memoryMb,
      };
    } catch (err: any) {
      const elapsedMs = Math.round(performance.now() - startTime);
      const isTimeout = err.name === 'AbortError';

      return {
        success: false,
        stdout: '',
        stderr: isTimeout
          ? 'Time Limit Exceeded (TLE): Code execution exceeded sandbox time threshold.'
          : err.message || 'Execution error encountered.',
        statusDescription: isTimeout ? 'Time Limit Exceeded' : 'Error',
        exitCode: isTimeout ? 137 : 1,
        executionTimeMs: elapsedMs,
      };
    }
  }
}

export const compilerService = new CompilerService();
