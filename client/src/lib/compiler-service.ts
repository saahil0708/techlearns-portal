import axios from 'axios';

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

const JUDGE0_ENDPOINT =
  process.env.NEXT_PUBLIC_JUDGE0_ENDPOINT ||
  'https://ce.judge0.com/submissions?wait=true&base64_encoded=false';

export function wrapCodeWithHarness(lang: SupportedCompilerLang, sourceCode: string): string {
  const code = sourceCode.trim();

  if (lang === 'python') {
    const hasTopLevelDriver = /^(print\s*\(|if\s+__name__\s*==|\w+\s*=\s*sys\.stdin|\w+\s*=\s*input\()/m.test(code);
    if (hasTopLevelDriver) {
      return code;
    }

    const pythonHarness = `

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
    return code + pythonHarness;
  }

  if (lang === 'javascript' || lang === 'typescript') {
    const hasConsoleLog = /console\.log\s*\(/m.test(code);
    if (hasConsoleLog) return code;

    const jsHarness = `

// --- Auto-Injected Test Harness ---
const fs = require('fs');
try {
  const input = fs.readFileSync(0, 'utf-8').trim();
  if (input) {
    const tokens = input.split(/\\s+/);
    let targetFunc = typeof solve === 'function' ? solve : (typeof Solution === 'function' ? new Solution().solve : null);
    if (targetFunc) {
      let args;
      if (tokens.length > 1 && !isNaN(tokens[0]) && Number(tokens[0]) === tokens.length - 1) {
        args = [tokens.slice(1).map(Number)];
      } else {
        args = [tokens.map(Number)];
      }
      const res = targetFunc(...args);
      if (res !== undefined) {
        console.log(Array.isArray(res) ? res.join(' ') : res);
      }
    }
  }
} catch (e) {}
`;
    return code + jsHarness;
  }

  if (lang === 'java') {
    const hasMain = /public\s+static\s+void\s+main\s*\(/m.test(code);

    if (hasMain) {
      // If a class containing main() exists but is not named Main, normalize it to class Main
      if (!/\bclass\s+Main\b/.test(code)) {
        return code.replace(
          /\b(?:public\s+)?class\s+([A-Za-z0-9_]+)((?:(?!class\b)[\s\S])*?public\s+static\s+void\s+main\s*\()/m,
          'class Main$2',
        );
      }
      return code;
    }

    // LeetCode-style solution without main method: inject driver harness
    const javaHarness = `

// --- Auto-Injected Test Harness ---
class Main {
    public static void main(String[] args) {
        try {
            java.util.Scanner sc = new java.util.Scanner(System.in);
            if (!sc.hasNext()) return;
            java.util.List<Long> nums = new java.util.ArrayList<>();
            while (sc.hasNextLong()) {
                nums.add(sc.nextLong());
            }
            if (nums.isEmpty()) return;

            long[] arr;
            if (nums.size() > 1 && nums.get(0) == nums.size() - 1) {
                arr = new long[nums.size() - 1];
                for (int i = 1; i < nums.size(); i++) arr[i - 1] = nums.get(i);
            } else {
                arr = new long[nums.size()];
                for (int i = 0; i < nums.size(); i++) arr[i] = nums.get(i);
            }

            Solution solver = new Solution();
            java.lang.reflect.Method[] methods = Solution.class.getDeclaredMethods();
            int[] intArr = new int[arr.length];
            for (int i = 0; i < arr.length; i++) intArr[i] = (int) arr[i];

            for (java.lang.reflect.Method m : methods) {
                if (m.getName().startsWith("_") || java.lang.reflect.Modifier.isStatic(m.getModifiers())) continue;
                m.setAccessible(true);
                Class<?>[] pTypes = m.getParameterTypes();
                Object res = null;
                boolean matched = false;

                if (pTypes.length == 1) {
                    if (pTypes[0].equals(int[].class)) {
                        res = m.invoke(solver, (Object) intArr);
                        matched = true;
                    } else if (pTypes[0].equals(long[].class)) {
                        res = m.invoke(solver, (Object) arr);
                        matched = true;
                    } else if (pTypes[0].equals(int.class) && intArr.length > 0) {
                        res = m.invoke(solver, intArr[0]);
                        matched = true;
                    } else if (pTypes[0].equals(long.class) && arr.length > 0) {
                        res = m.invoke(solver, arr[0]);
                        matched = true;
                    }
                } else if (pTypes.length == 2) {
                    if (pTypes[0].equals(int[].class) && pTypes[1].equals(int.class) && intArr.length > 1) {
                        int target = intArr[intArr.length - 1];
                        int[] prefix = java.util.Arrays.copyOf(intArr, intArr.length - 1);
                        res = m.invoke(solver, prefix, target);
                        matched = true;
                    } else if (pTypes[0].equals(int.class) && pTypes[1].equals(int[].class) && intArr.length > 1) {
                        int target = intArr[0];
                        int[] suffix = java.util.Arrays.copyOfRange(intArr, 1, intArr.length);
                        res = m.invoke(solver, target, suffix);
                        matched = true;
                    }
                }

                if (matched) {
                    if (res != null) {
                        if (res instanceof long[]) {
                            long[] a = (long[]) res;
                            StringBuilder sb = new StringBuilder();
                            for (int i = 0; i < a.length; i++) {
                                if (i > 0) sb.append(' ');
                                sb.append(a[i]);
                            }
                            System.out.println(sb.toString());
                        } else if (res instanceof int[]) {
                            int[] a = (int[]) res;
                            StringBuilder sb = new StringBuilder();
                            for (int i = 0; i < a.length; i++) {
                                if (i > 0) sb.append(' ');
                                sb.append(a[i]);
                            }
                            System.out.println(sb.toString());
                        } else if (res instanceof Object[]) {
                            Object[] a = (Object[]) res;
                            StringBuilder sb = new StringBuilder();
                            for (int i = 0; i < a.length; i++) {
                                if (i > 0) sb.append(' ');
                                sb.append(a[i]);
                            }
                            System.out.println(sb.toString());
                        } else {
                            System.out.println(res);
                        }
                    }
                    break;
                }
            }
        } catch (Throwable e) {
            e.printStackTrace(System.err);
            System.exit(1);
        }
    }
}
`;
    // Strip public keyword from user's Solution class so it can co-exist with Main in Main.java
    const normalizedCode = code.replace(/\bpublic\s+class\s+([A-Za-z0-9_]+)/g, 'class $1');
    return normalizedCode + javaHarness;
  }

  return code;
}

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
    const finalCode = wrapCodeWithHarness(lang, sourceCode);

    try {
      const response = await axios.post(
        JUDGE0_ENDPOINT,
        {
          language_id: config.judge0Id,
          source_code: finalCode,
          stdin: stdin || '',
          cpu_time_limit: 5,
          memory_limit: 262144, // 256 MB
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          timeout: 15000,
        }
      );

      const elapsedMs = Math.round(performance.now() - startTime);
      const data = response.data;
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
      const isTimeout =
        (axios.isAxiosError(err) && (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT')) ||
        err.name === 'AbortError' ||
        err.code === 'ECONNABORTED' ||
        err.code === 'ETIMEDOUT';

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
