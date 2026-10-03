export interface ParsedLessonImport {
  title: string;
  content?: string;
  type?: 'reading' | 'code' | 'quiz' | 'lab';
  durationMinutes?: number;
  importantNotes?: string[];
  quizMCQ?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  } | null;
  codingProblem?: {
    title: string;
    difficulty?: string;
    starterCode?: string;
    testCases?: Array<{ input: string; output: string }>;
  } | null;
  order?: number;
}

export interface ParsedModuleImport {
  title: string;
  description?: string;
  order?: number;
  lessons: ParsedLessonImport[];
}

export interface CourseMetadataImport {
  title?: string;
  code?: string;
  description?: string;
  level?: string;
  category?: string;
  tags?: string[];
}

export interface ParseResult {
  success: boolean;
  courseMetadata?: CourseMetadataImport;
  modules: ParsedModuleImport[];
  stats: {
    totalModules: number;
    totalLessons: number;
    totalQuizzes: number;
    totalCodingProblems: number;
    totalNotes: number;
  };
  errors: string[];
  warnings: string[];
}

/**
 * Robust CSV parser that handles multi-line fields, escaped quotes, and commas inside cells.
 */
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        // Skip CR in CRLF
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        if (currentRow.some((c) => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Parse CSV/Excel export string into nested Modules and Lessons
 */
export function parseCurriculumCsv(csvText: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const rows = parseCsvRows(csvText);

  if (rows.length < 2) {
    return {
      success: false,
      modules: [],
      stats: { totalModules: 0, totalLessons: 0, totalQuizzes: 0, totalCodingProblems: 0, totalNotes: 0 },
      errors: ['The CSV file is empty or missing a header row.'],
      warnings: [],
    };
  }

  const headers = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const getCol = (possibleNames: string[]) => {
    return headers.findIndex((h) => possibleNames.some((p) => h.includes(p)));
  };

  const modTitleIdx = getCol(['moduletitle', 'module', 'unit', 'chapter']);
  const modDescIdx = getCol(['moduledescription', 'moduledesc', 'unitdesc']);
  const lessonTitleIdx = getCol(['lessontitle', 'lesson', 'submodule', 'topic']);
  const lessonTypeIdx = getCol(['lessontype', 'type']);
  const durationIdx = getCol(['duration', 'durationminutes', 'minutes', 'time']);
  const contentIdx = getCol(['lessoncontent', 'content', 'body', 'text']);
  const notesIdx = getCol(['keynotes', 'notes', 'importantnotes']);
  const quizQIdx = getCol(['quizquestion', 'question', 'quiz']);
  const quizOptsIdx = getCol(['quizoptions', 'options', 'choices']);
  const quizAnsIdx = getCol(['correctoption', 'answer', 'correctindex', 'correct']);
  const quizExpIdx = getCol(['quizexplanation', 'explanation']);
  const codeTitleIdx = getCol(['codingproblemtitle', 'problemtitle', 'labtitle', 'codingtitle']);
  const codeStarterIdx = getCol(['codingproblemstarter', 'startercode', 'starter']);
  const codeTestsIdx = getCol(['codingtestcases', 'testcases', 'tests']);

  if (modTitleIdx === -1 && lessonTitleIdx === -1) {
    return {
      success: false,
      modules: [],
      stats: { totalModules: 0, totalLessons: 0, totalQuizzes: 0, totalCodingProblems: 0, totalNotes: 0 },
      errors: ['CSV must contain at least a "Module Title" or "Lesson Title" column.'],
      warnings: [],
    };
  }

  const moduleMap = new Map<string, ParsedModuleImport>();
  const moduleOrder: string[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const rawModTitle = modTitleIdx !== -1 ? row[modTitleIdx] : '';
    const rawModDesc = modDescIdx !== -1 ? row[modDescIdx] : '';
    const rawLessonTitle = lessonTitleIdx !== -1 ? row[lessonTitleIdx] : '';
    const rawLessonType = lessonTypeIdx !== -1 ? row[lessonTypeIdx]?.toLowerCase() : 'reading';
    const rawDuration = durationIdx !== -1 ? parseInt(row[durationIdx], 10) : 15;
    const rawContent = contentIdx !== -1 ? row[contentIdx] : '';
    const rawNotes = notesIdx !== -1 ? row[notesIdx] : '';

    const moduleKey = rawModTitle?.trim() || 'General Module';

    if (!moduleMap.has(moduleKey)) {
      moduleMap.set(moduleKey, {
        title: moduleKey,
        description: rawModDesc?.trim() || undefined,
        order: moduleOrder.length,
        lessons: [],
      });
      moduleOrder.push(moduleKey);
    }

    const currentMod = moduleMap.get(moduleKey)!;
    if (rawModDesc?.trim() && !currentMod.description) {
      currentMod.description = rawModDesc.trim();
    }

    if (rawLessonTitle?.trim()) {
      // Parse Notes
      const notesList = rawNotes
        ? rawNotes
            .split('|')
            .map((n) => n.trim())
            .filter((n) => n.length > 0)
        : [];

      // Parse Quiz
      let quizMCQ = null;
      const qText = quizQIdx !== -1 ? row[quizQIdx]?.trim() : '';
      if (qText) {
        const rawOpts = quizOptsIdx !== -1 ? row[quizOptsIdx] : '';
        const options = rawOpts
          ? rawOpts.split('|').map((o) => o.trim()).filter(Boolean)
          : ['Option A', 'Option B', 'Option C', 'Option D'];
        const rawAns = quizAnsIdx !== -1 ? row[quizAnsIdx]?.trim() : '0';
        let correctIndex = parseInt(rawAns, 10);
        if (isNaN(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
          // Check if answer is letter e.g. A, B, C or exact string match
          const upperAns = rawAns.toUpperCase();
          if (['A', 'B', 'C', 'D'].includes(upperAns)) {
            correctIndex = upperAns.charCodeAt(0) - 65;
          } else {
            const matchIdx = options.findIndex((o) => o.toLowerCase() === rawAns.toLowerCase());
            correctIndex = matchIdx !== -1 ? matchIdx : 0;
          }
        }
        quizMCQ = {
          question: qText,
          options,
          correctIndex,
          explanation: quizExpIdx !== -1 ? row[quizExpIdx]?.trim() : undefined,
        };
      }

      // Parse Coding Problem
      let codingProblem = null;
      const codeTitle = codeTitleIdx !== -1 ? row[codeTitleIdx]?.trim() : '';
      if (codeTitle) {
        let testCases: Array<{ input: string; output: string }> = [];
        if (codeTestsIdx !== -1 && row[codeTestsIdx]) {
          try {
            testCases = JSON.parse(row[codeTestsIdx]);
          } catch {
            warnings.push(`Row ${r + 1}: Coding test cases could not be parsed as JSON, defaulted to sample test case.`);
            testCases = [{ input: 'sample_input', output: 'sample_output' }];
          }
        }
        codingProblem = {
          title: codeTitle,
          starterCode: codeStarterIdx !== -1 ? row[codeStarterIdx] : '# Write your solution here\n',
          testCases,
        };
      }

      const validatedType: 'reading' | 'code' | 'quiz' | 'lab' =
        codingProblem || rawLessonType === 'code' || rawLessonType === 'lab'
          ? 'code'
          : quizMCQ || rawLessonType === 'quiz'
          ? 'quiz'
          : 'reading';

      currentMod.lessons.push({
        title: rawLessonTitle.trim(),
        content: rawContent || '',
        type: validatedType,
        durationMinutes: isNaN(rawDuration) || rawDuration < 1 ? 15 : rawDuration,
        importantNotes: notesList.length > 0 ? notesList : undefined,
        quizMCQ,
        codingProblem,
        order: currentMod.lessons.length,
      });
    }
  }

  const modules = moduleOrder.map((k) => moduleMap.get(k)!);

  return calculateStats(modules, errors, warnings);
}

/**
 * Ultra-robust JSON parser that handles:
 * - Markdown code fences (```json ... ```)
 * - Raw unescaped newlines/tabs inside string literals (Bad control character errors)
 * - Smart/curly quotes (“ ” ‘ ’)
 * - Trailing commas in objects & arrays
 * - Relaxed JavaScript object literal syntax
 */
export function robustParseJson(rawText: string): any {
  let cleaned = (rawText || '').trim();

  // 1. Strip markdown fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z0-9_-]*\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
  }

  // 2. Replace smart/curly quotes with standard ASCII quotes
  cleaned = cleaned
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");

  // 3. Try standard JSON.parse first
  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue to sanitize
  }

  // 4. Sanitize control characters and unescaped newlines/tabs inside string literals
  let sanitized = '';
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];

    if (inString) {
      if (isEscaped) {
        sanitized += ch;
        isEscaped = false;
      } else if (ch === '\\') {
        sanitized += ch;
        isEscaped = true;
      } else if (ch === '"') {
        sanitized += ch;
        inString = false;
      } else if (ch === '\n') {
        sanitized += '\\n';
      } else if (ch === '\r') {
        // drop raw CR
      } else if (ch === '\t') {
        sanitized += '\\t';
      } else if (ch.charCodeAt(0) < 0x20) {
        // other control characters (0x00 - 0x1F)
        sanitized += `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`;
      } else {
        sanitized += ch;
      }
    } else {
      if (ch === '"') {
        sanitized += ch;
        inString = true;
      } else {
        sanitized += ch;
      }
    }
  }

  // 5. Strip trailing commas before closing } and ]
  sanitized = sanitized.replace(/,\s*([}\]])/g, '$1');

  try {
    return JSON.parse(sanitized);
  } catch (err2) {
    // 6. Safe JavaScript Object literal fallback
    try {
      const fn = new Function(`"use strict"; return (${cleaned});`);
      return fn();
    } catch {
      throw err2;
    }
  }
}

/**
 * Parse JSON curriculum data
 */
export function parseCurriculumJson(jsonText: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const raw = robustParseJson(jsonText);
    const rawModules = Array.isArray(raw) ? raw : Array.isArray(raw.modules) ? raw.modules : null;

    if (!rawModules || rawModules.length === 0) {
      return {
        success: false,
        modules: [],
        stats: { totalModules: 0, totalLessons: 0, totalQuizzes: 0, totalCodingProblems: 0, totalNotes: 0 },
        errors: ['JSON must contain an array of modules (e.g. `[ { "title": "Module 1", "lessons": [...] } ]` or `{ "course": {...}, "modules": [...] }`).'],
        warnings: [],
      };
    }

    const modules: ParsedModuleImport[] = rawModules.map((m: any, mIdx: number) => {
      const lessons: ParsedLessonImport[] = Array.isArray(m.lessons)
        ? m.lessons.map((l: any, lIdx: number) => ({
            title: l.title || `Lesson ${lIdx + 1}`,
            content: l.content || '',
            type: (l.type as any) || (l.codingProblem ? 'code' : l.quizMCQ ? 'quiz' : 'reading'),
            durationMinutes: typeof l.durationMinutes === 'number' ? l.durationMinutes : 15,
            importantNotes: Array.isArray(l.importantNotes) ? l.importantNotes : undefined,
            quizMCQ: l.quizMCQ
              ? {
                  question: l.quizMCQ.question || 'Multiple Choice Question',
                  options: Array.isArray(l.quizMCQ.options) ? l.quizMCQ.options : ['Option A', 'Option B'],
                  correctIndex: typeof l.quizMCQ.correctIndex === 'number' ? l.quizMCQ.correctIndex : 0,
                  explanation: l.quizMCQ.explanation,
                }
              : null,
            codingProblem: l.codingProblem
              ? {
                  title: l.codingProblem.title || l.title || 'Coding Challenge',
                  starterCode: l.codingProblem.starterCode || '# Write code here\n',
                  testCases: Array.isArray(l.codingProblem.testCases) ? l.codingProblem.testCases : [],
                }
              : null,
            order: typeof l.order === 'number' ? l.order : lIdx,
          }))
        : [];

      return {
        title: m.title || `Module ${mIdx + 1}`,
        description: m.description,
        order: typeof m.order === 'number' ? m.order : mIdx,
        lessons,
      };
    });

    const courseMetadata: CourseMetadataImport | undefined = raw.course
      ? {
          title: raw.course.title || raw.title,
          code: raw.course.code || raw.code,
          description: raw.course.description || raw.description,
          level: raw.course.level || raw.level,
          category: raw.course.category || raw.category,
          tags: Array.isArray(raw.course.tags) ? raw.course.tags : Array.isArray(raw.tags) ? raw.tags : undefined,
        }
      : raw.title
      ? {
          title: raw.title,
          code: raw.code,
          description: raw.description,
          level: raw.level,
          category: raw.category,
          tags: Array.isArray(raw.tags) ? raw.tags : undefined,
        }
      : undefined;

    return calculateStats(modules, errors, warnings, courseMetadata);
  } catch (err: any) {
    return {
      success: false,
      modules: [],
      stats: { totalModules: 0, totalLessons: 0, totalQuizzes: 0, totalCodingProblems: 0, totalNotes: 0 },
      errors: [`JSON syntax error: ${err?.message || 'Invalid JSON format.'}`],
      warnings: [],
    };
  }
}

/**
 * Parse Structured Markdown / Text Curriculum
 * Supports `# Module Title` and `## Lesson Title` hierarchies with bullet notes.
 */
export function parseCurriculumMarkdown(mdText: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const lines = mdText.split('\n');

  const modules: ParsedModuleImport[] = [];
  let currentModule: ParsedModuleImport | null = null;
  let currentLesson: ParsedLessonImport | null = null;
  let lessonContentBuffer: string[] = [];

  const flushLesson = () => {
    if (currentLesson && currentModule) {
      if (lessonContentBuffer.length > 0) {
        currentLesson.content = lessonContentBuffer.join('\n').trim();
      }
      currentModule.lessons.push(currentLesson);
      currentLesson = null;
      lessonContentBuffer = [];
    }
  };

  const flushModule = () => {
    flushLesson();
    if (currentModule) {
      modules.push(currentModule);
      currentModule = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // H1: Module Header
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      flushModule();
      const title = trimmed.replace(/^#\s+/, '').trim();
      currentModule = {
        title: title || `Module ${modules.length + 1}`,
        order: modules.length,
        lessons: [],
      };
      continue;
    }

    // H2: Lesson Header
    if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
      flushLesson();
      if (!currentModule) {
        currentModule = {
          title: 'Module 1: Foundations',
          order: 0,
          lessons: [],
        };
      }
      const title = trimmed.replace(/^##\s+/, '').trim();
      currentLesson = {
        title: title || `Lesson ${currentModule.lessons.length + 1}`,
        content: '',
        type: 'reading',
        durationMinutes: 20,
        importantNotes: [],
        order: currentModule.lessons.length,
      };
      continue;
    }

    // Notes line prefix (e.g., "> Note:" or "- [Note]")
    if (currentLesson && (trimmed.startsWith('> Note:') || trimmed.startsWith('- Note:') || trimmed.startsWith('* Note:'))) {
      const noteText = trimmed.replace(/^[>\-\*]\s*Note:\s*/i, '').trim();
      if (noteText) {
        if (!currentLesson.importantNotes) currentLesson.importantNotes = [];
        currentLesson.importantNotes.push(noteText);
      }
      continue;
    }

    if (currentLesson) {
      lessonContentBuffer.push(line);
    }
  }

  flushModule();

  if (modules.length === 0) {
    return {
      success: false,
      modules: [],
      stats: { totalModules: 0, totalLessons: 0, totalQuizzes: 0, totalCodingProblems: 0, totalNotes: 0 },
      errors: ['Could not detect any `# Module` or `## Lesson` sections in the Markdown file.'],
      warnings: [],
    };
  }

  return calculateStats(modules, errors, warnings);
}

function calculateStats(
  modules: ParsedModuleImport[],
  errors: string[],
  warnings: string[],
  courseMetadata?: CourseMetadataImport,
): ParseResult {
  let totalLessons = 0;
  let totalQuizzes = 0;
  let totalCodingProblems = 0;
  let totalNotes = 0;

  modules.forEach((m) => {
    m.lessons.forEach((l) => {
      totalLessons++;
      if (l.quizMCQ) totalQuizzes++;
      if (l.codingProblem) totalCodingProblems++;
      if (l.importantNotes) totalNotes += l.importantNotes.length;
    });
  });

  return {
    success: errors.length === 0 && modules.length > 0,
    courseMetadata,
    modules,
    stats: {
      totalModules: modules.length,
      totalLessons,
      totalQuizzes,
      totalCodingProblems,
      totalNotes,
    },
    errors,
    warnings,
  };
}

/**
 * Downloadable template file contents
 */
export function generateCurriculumCsvTemplate(): string {
  return `"Module Title","Module Description","Lesson Title","Lesson Type","Duration (Mins)","Lesson Content","Key Notes (pipe-separated)","Quiz Question","Quiz Options (pipe-separated)","Correct Option Index (0-based)","Coding Problem Title","Coding Problem Starter Code","Coding Test Cases (JSON)"
"Module 1: Foundations & Memory Architecture","Deep dive into computer memory models and sequential containers.","Memory Layout & Pointer Basics","reading",15,"# Memory Layout\nUnderstanding heap vs stack allocations and pointers.","Stack is fast and auto-managed|Heap stores dynamic runtime memory","","","","","",""
"Module 1: Foundations & Memory Architecture","Deep dive into computer memory models and sequential containers.","Array Basics Knowledge Check","quiz",10,"","Review contiguous arrays before starting.","What is the time complexity of random array indexing by subscript?","O(N)|O(log N)|O(1)|O(N^2)",2,"","",""
"Module 1: Foundations & Memory Architecture","Deep dive into computer memory models and sequential containers.","Interactive Code Lab: Two-Sum","code",30,"Given an array of integers and a target sum, find indices of the two numbers.","Hash map lookup achieves O(N) runtime","","","","Two Sum Problem","def two_sum(nums, target):\n    # TODO: implement\n    pass","[{\\"input\\": \\"[2,7,11,15] 9\\", \\"output\\": \\"[0, 1]\\"}]"
"Module 2: Dynamic Structures & Trees","Binary trees, AVL balancers, and traversal algorithms.","Binary Search Tree Insertion","reading",20,"# Binary Search Trees\nLeft subtree contains keys less than root; right contains keys greater.","BST search average is O(log N)|Worst case degenerate tree is O(N)","","","","","",""
`;
}

export function generateCurriculumJsonTemplate(): string {
  return JSON.stringify(
    {
      mode: 'append',
      modules: [
        {
          title: 'Module 1: Foundations & Memory Architecture',
          description: 'Deep dive into computer memory models and sequential containers.',
          order: 0,
          lessons: [
            {
              title: 'Memory Layout & Pointer Basics',
              type: 'reading',
              durationMinutes: 15,
              content: '# Memory Layout\nUnderstanding heap vs stack allocations and pointers.',
              importantNotes: ['Stack is fast and auto-managed', 'Heap stores dynamic runtime memory'],
            },
            {
              title: 'Array Basics Knowledge Check',
              type: 'quiz',
              durationMinutes: 10,
              importantNotes: ['Review contiguous arrays before starting.'],
              quizMCQ: {
                question: 'What is the time complexity of random array indexing by subscript?',
                options: ['O(N)', 'O(log N)', 'O(1)', 'O(N^2)'],
                correctIndex: 2,
                explanation: 'Direct memory pointer offset calculation happens in constant time O(1).',
              },
            },
            {
              title: 'Interactive Code Lab: Two-Sum',
              type: 'code',
              durationMinutes: 30,
              content: 'Given an array of integers and a target sum, find indices of the two numbers.',
              importantNotes: ['Hash map lookup achieves O(N) runtime'],
              codingProblem: {
                title: 'Two Sum Problem',
                starterCode: 'def two_sum(nums, target):\n    # TODO: implement\n    pass',
                testCases: [{ input: '[2,7,11,15] 9', output: '[0, 1]' }],
              },
            },
          ],
        },
      ],
    },
    null,
    2,
  );
}

export function generateCurriculumMdTemplate(): string {
  return `# Module 1: Foundations & Memory Architecture
Deep dive into computer memory models and sequential containers.

## Memory Layout & Pointer Basics
Understanding heap vs stack allocations and pointers in modern systems.
> Note: Stack is fast and auto-managed by the CPU runtime.
> Note: Heap stores dynamic heap-allocated pointers.

## Array Memory & Contiguous Layout
Arrays store homogeneous elements in contiguous cache lines for fast lookups.
> Note: Cache lines optimize consecutive index reading.

# Module 2: Non-Linear Graphs & Trees
Tree structures, binary search balance, and traversals.

## Binary Search Tree In-Order Traversal
In-order traversal produces non-decreasing sorted order.
> Note: Traversal time complexity is O(N).
`;
}
