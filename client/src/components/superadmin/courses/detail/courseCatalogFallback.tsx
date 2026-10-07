import React from 'react';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import type { CourseDirectoryEntity } from '@/types/course';
import type { TopicItem } from './types';

export const pythonCatalog: Record<number, TopicItem[]> = {
  0: [
    {
      id: '0-0',
      title: 'Interactive I/O & Output Formatting Engine',
      type: 'guide',
      duration: '12 mins',
      importantNotes: [
        'Standard sys.stdin.readline() reads bulk input streams in O(1) buffer chunks, essential for high-throughput 10^5+ test queries.',
        'Formatted f-strings (e.g. f"{val:.4f}") execute inline expressions at native CPython speeds without string concatenation overhead.',
      ],
      problems: [
        { id: 'p-101', title: 'High-Throughput Fast I/O Formatter', difficulty: 'Easy', score: 100, testCasesCount: 12, tags: ['Fast I/O', 'Formatting'] },
        { id: 'p-102', title: 'Precision Floating-Point Matrix Display', difficulty: 'Easy', score: 120, testCasesCount: 8, tags: ['Strings', 'Math'] },
      ],
    },
    {
      id: '0-1',
      title: 'Variables, Dynamic Typing & Memory Allocation',
      type: 'reading',
      duration: '18 mins',
      importantNotes: [
        'Python pre-allocates small integer references (-5 to 256) in an internal global cache to minimize heap memory thrashing.',
        'Variable assignments copy memory pointers, not underlying structures; mutable modifications propagate across references.',
      ],
      problems: [
        { id: 'p-103', title: 'Reference Pointer Swapper & Memory Inspector', difficulty: 'Easy', score: 100, testCasesCount: 10, tags: ['Memory', 'Pointers'] },
      ],
    },
    {
      id: '0-2',
      title: 'String Manipulation & Interpolation Patterns',
      type: 'lab',
      duration: '25 mins',
      problemTag: '4 Tests',
      importantNotes: [
        'Strings are strictly immutable; appending inside loops results in O(N²) quadratic allocations. Always accumulate in arrays and use "".join(list).',
        'Slicing s[::-1] performs memory-efficient reversal with optimized C memory stride copies.',
      ],
      problems: [
        { id: 'p-104', title: 'Valid Palindrome & Substring Inversion', difficulty: 'Easy', score: 120, testCasesCount: 14, tags: ['Strings', 'Two-Pointers'] },
        { id: 'p-105', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', score: 250, testCasesCount: 22, tags: ['Sliding Window', 'Hash Set'] },
      ],
    },
    {
      id: '0-3',
      title: 'Standard Input Streams & CLI Argument Parsing',
      type: 'guide',
      duration: '15 mins',
      importantNotes: [
        'Use sys.argv for raw flags and argparse for typed CLI argument boundaries and validation.',
      ],
      problems: [
        { id: 'p-106', title: 'POSIX CLI Flag Parser & Validator', difficulty: 'Easy', score: 100, testCasesCount: 10, tags: ['CLI', 'Parsing'] },
      ],
    },
    {
      id: '0-4',
      title: 'Conditional Branching & Boolean Logic Rules',
      type: 'lab',
      duration: '20 mins',
      problemTag: '6 Tests',
      importantNotes: [
        'Short-circuit evaluation: in (A or B), B is never evaluated if A is truthy; leverage this for null-pointer guard checks.',
        'Chained inequalities (e.g. 0 <= x < 100) are evaluated as (0 <= x and x < 100) efficiently without evaluating x twice.',
      ],
      problems: [
        { id: 'p-107', title: 'Leap Year & Gregorian Calendar Invariant', difficulty: 'Easy', score: 100, testCasesCount: 8, tags: ['Logic', 'Math'] },
        { id: 'p-108', title: 'Coordinate Quadrant & Intersection Solver', difficulty: 'Medium', score: 180, testCasesCount: 16, tags: ['Branching', 'Geometry'] },
      ],
    },
    {
      id: '0-5',
      title: 'Stack Traces & Interactive GDB/PDB Debugging',
      type: 'reading',
      duration: '22 mins',
      importantNotes: [
        'Use breakpoint() or import pdb; pdb.set_trace() to step through frame stacks during local sandbox execution.',
      ],
    },
    {
      id: '0-6',
      title: 'Arrays, Iteration & Asymptotic Big-O Basics',
      type: 'lab',
      duration: '30 mins',
      problemTag: '8 Tests',
      importantNotes: [
        'List index lookup and amortized append() are O(1); insert(0, item) and pop(0) require O(N) element shifts.',
        'Two-pointer scanning patterns compress nested O(N²) quadratic loops down to O(N) linear time.',
      ],
      problems: [
        { id: 'p-109', title: 'Running Sum & Prefix Array Accumulator', difficulty: 'Easy', score: 100, testCasesCount: 12, tags: ['Arrays', 'Prefix Sum'] },
        { id: 'p-110', title: 'Two Sum: Optimal Hash Map Lookup', difficulty: 'Easy', score: 150, testCasesCount: 20, tags: ['Hash Table', 'Arrays'] },
        { id: 'p-111', title: 'Subarray Sum Equals K Optimization', difficulty: 'Medium', score: 300, testCasesCount: 28, tags: ['Prefix Sum', 'Hash Map'] },
      ],
    },
    {
      id: '0-7',
      title: 'Function Signatures, Scope & Return Values',
      type: 'guide',
      duration: '16 mins',
      importantNotes: [
        'Default parameter values are evaluated once at function definition time; avoid mutable default values (use def fn(x=None) instead of def fn(x=[])).',
      ],
      problems: [
        { id: 'p-112', title: 'Safe Default Argument Sanitizer', difficulty: 'Easy', score: 120, testCasesCount: 10, tags: ['Functions', 'Scope'] },
      ],
    },
    {
      id: '0-8',
      title: 'Tuples, Hash Sets & Key-Value Dictionaries',
      type: 'lab',
      duration: '28 mins',
      problemTag: '5 Tests',
      importantNotes: [
        'Dict keys and Set members must be hashable (__hash__ and __eq__); mutable lists cannot serve as keys, but immutable tuples can.',
        'Set union (|) and intersection (&) perform in O(min(len(s), len(t))) average time.',
      ],
      problems: [
        { id: 'p-113', title: 'Intersection of Two Unsorted Arrays', difficulty: 'Easy', score: 110, testCasesCount: 15, tags: ['Hash Set', 'Arrays'] },
        { id: 'p-114', title: 'Group Anagrams by Hash Frequency', difficulty: 'Medium', score: 240, testCasesCount: 20, tags: ['Hash Table', 'Strings'] },
      ],
    },
    {
      id: '0-9',
      title: 'Module 1 Capstone: Algorithmic Diagnostic Lab',
      type: 'quiz',
      duration: '35 mins',
      problemTag: 'Graded',
      importantNotes: [
        'Comprehensive timed diagnostic covering fast I/O, array sliding windows, dictionary lookups, and edge-case testing.',
      ],
      problems: [
        { id: 'p-115', title: 'Capstone Diagnostic: Log Stream Transaction Matcher', difficulty: 'Hard', score: 400, testCasesCount: 35, tags: ['Capstone', 'Algorithms'] },
      ],
    },
  ],
  1: [
    {
      id: '1-0',
      title: 'While Loops & Flow Control (break, continue, pass)',
      type: 'guide',
      duration: '14 mins',
      importantNotes: ['Always ensure termination criteria in while loops to prevent infinite execution traps in competitive sandboxes.'],
      problems: [
        { id: 'p-201', title: 'Collatz Conjecture Cycle Counter', difficulty: 'Easy', score: 100, testCasesCount: 10, tags: ['Loops', 'Math'] },
      ],
    },
    {
      id: '1-1',
      title: 'For-in Loops & the Range Iterator Protocol',
      type: 'lab',
      duration: '22 mins',
      problemTag: '5 Tests',
      importantNotes: ['range(start, stop, step) generates values on-the-fly via generators without memory consumption.'],
      problems: [
        { id: 'p-202', title: 'Arithmetic Progression Sieve', difficulty: 'Easy', score: 110, testCasesCount: 12, tags: ['Iterators', 'Loops'] },
      ],
    },
    {
      id: '1-2',
      title: 'List Comprehensions & Conditional Filtering',
      type: 'lab',
      duration: '26 mins',
      problemTag: '6 Tests',
      importantNotes: ['[f(x) for x in seq if cond(x)] is implemented in C-level bytecode, executing up to 35% faster than explicit loop appends.'],
      problems: [
        { id: 'p-203', title: 'Square of Sorted Array (Two-Pointer In-Place)', difficulty: 'Easy', score: 130, testCasesCount: 16, tags: ['List Comprehension', 'Two-Pointers'] },
      ],
    },
    {
      id: '1-3',
      title: 'Dictionary & Set Comprehensions with Inversions',
      type: 'guide',
      duration: '18 mins',
      importantNotes: ['Inverting dictionaries via {v: k for k, v in d.items()} requires unique values; collisions silently overwrite.'],
      problems: [
        { id: 'p-204', title: 'Bi-directional Phone Directory Inversion', difficulty: 'Easy', score: 120, testCasesCount: 10, tags: ['Dict Comprehension', 'Hash Map'] },
      ],
    },
    {
      id: '1-4',
      title: 'Iterators, Generators & the Yield Keyword',
      type: 'reading',
      duration: '25 mins',
      importantNotes: ['Generators maintain execution state suspended in frame objects, allowing processing of infinite data streams with O(1) space.'],
      problems: [
        { id: 'p-205', title: 'Fibonacci Generator with Constant Memory', difficulty: 'Easy', score: 100, testCasesCount: 8, tags: ['Generators', 'Memory'] },
      ],
    },
    {
      id: '1-5',
      title: 'Built-in Itertools: zip_longest, groupby, cycle',
      type: 'guide',
      duration: '20 mins',
      importantNotes: ['itertools.groupby requires inputs to be pre-sorted by the grouping key.'],
      problems: [
        { id: 'p-206', title: 'Run-Length Encoding Compressor', difficulty: 'Medium', score: 200, testCasesCount: 18, tags: ['Itertools', 'Compression'] },
      ],
    },
    {
      id: '1-6',
      title: 'Enumerate, Zip & Unpacking Idioms (*args, **kwargs)',
      type: 'lab',
      duration: '24 mins',
      problemTag: '6 Tests',
      importantNotes: ['Extended iterable unpacking: first, *middle, last = seq extracts boundary elements cleanly.'],
      problems: [
        { id: 'p-207', title: 'Matrix Transposition via Zip Unpacking', difficulty: 'Easy', score: 120, testCasesCount: 12, tags: ['Zip', 'Matrices'] },
      ],
    },
    {
      id: '1-7',
      title: 'Nested Loops & Grid/Matrix Traversal Techniques',
      type: 'lab',
      duration: '35 mins',
      problemTag: '10 Tests',
      importantNotes: ['Row-major traversal list[r][c] maximizes hardware CPU cache line spatial locality compared to column-major jumps.'],
      problems: [
        { id: 'p-208', title: 'Spiral Matrix Spiral Order Traversal', difficulty: 'Medium', score: 280, testCasesCount: 24, tags: ['Matrices', 'Simulation'] },
        { id: 'p-209', title: 'Search a 2D Matrix II (O(M+N) Stepwise)', difficulty: 'Medium', score: 300, testCasesCount: 26, tags: ['Binary Search', 'Matrices'] },
      ],
    },
    {
      id: '1-8',
      title: 'Sorting Algorithms: Timsort, Custom Keys & Lambdas',
      type: 'lab',
      duration: '30 mins',
      problemTag: '8 Tests',
      importantNotes: ['Python uses Timsort (hybrid Merge/Insertion Sort) providing O(N log N) worst-case and O(N) best-case adaptive stability.'],
      problems: [
        { id: 'p-210', title: 'Custom Multi-Attribute Leaderboard Sorter', difficulty: 'Easy', score: 140, testCasesCount: 15, tags: ['Sorting', 'Lambdas'] },
        { id: 'p-211', title: 'Merge Intervals Overlap Resolver', difficulty: 'Medium', score: 260, testCasesCount: 22, tags: ['Intervals', 'Sorting'] },
      ],
    },
    {
      id: '1-9',
      title: 'Module 2 Capstone: Data Transformation Engine',
      type: 'quiz',
      duration: '45 mins',
      problemTag: 'Graded',
      importantNotes: ['Complex end-of-module challenge integrating multidimensional matrix rotations, grouped transformations, and streaming generators.'],
      problems: [
        { id: 'p-212', title: 'Capstone: Spatial Image Transformation Pipeline', difficulty: 'Hard', score: 450, testCasesCount: 38, tags: ['Capstone', 'Matrix', 'Pipeline'] },
      ],
    },
  ],
  2: [
    {
      id: '2-0',
      title: 'Pure Functions, Immutability & Side Effects',
      type: 'reading',
      duration: '15 mins',
      importantNotes: ['Pure functions have referential transparency: calling with identical arguments always produces identical outputs.'],
    },
    {
      id: '2-1',
      title: 'First-Class Functions & Higher-Order Functions',
      type: 'guide',
      duration: '18 mins',
      importantNotes: ['Functions can be passed as arguments, assigned to variables, and returned from other functions dynamically.'],
      problems: [
        { id: 'p-301', title: 'Pipeline Function Chaining Combinator', difficulty: 'Easy', score: 120, testCasesCount: 10, tags: ['Functional', 'Higher-Order'] },
      ],
    },
    {
      id: '2-2',
      title: 'Anonymous Lambda Functions & Inline Mapping',
      type: 'lab',
      duration: '22 mins',
      problemTag: '5 Tests',
      importantNotes: ['Keep lambdas to single expressions; use def statements when multi-step branches or docstrings are required.'],
      problems: [
        { id: 'p-302', title: 'Lexicographical Coordinate Key Generator', difficulty: 'Easy', score: 110, testCasesCount: 12, tags: ['Lambdas', 'Sorting'] },
      ],
    },
    {
      id: '2-3',
      title: 'Map, Filter & Reduce: Functional Streams',
      type: 'lab',
      duration: '28 mins',
      problemTag: '7 Tests',
      importantNotes: ['functools.reduce accumulates pairs sequentially across iterables; provide an initializer to handle empty sequences safely.'],
      problems: [
        { id: 'p-303', title: 'Map-Reduce Log Event Aggregator', difficulty: 'Medium', score: 220, testCasesCount: 18, tags: ['Functional', 'Streams'] },
      ],
    },
    {
      id: '2-4',
      title: 'Closures & Lexical Scoping (nonlocal keyword)',
      type: 'reading',
      duration: '20 mins',
      importantNotes: ['A closure retains access to variables in its enclosing scope even after the enclosing function has finished executing.'],
      problems: [
        { id: 'p-304', title: 'Stateful Accumulator Closure Factory', difficulty: 'Easy', score: 130, testCasesCount: 10, tags: ['Closures', 'Scope'] },
      ],
    },
    {
      id: '2-5',
      title: 'Function Decorators: Logging, Timing & Auth Wrappers',
      type: 'lab',
      duration: '35 mins',
      problemTag: '8 Tests',
      importantNotes: ['Always use @functools.wraps(fn) inside decorators to preserve original function name, docstring, and annotations.'],
      problems: [
        { id: 'p-305', title: 'Execution Benchmark & Retry Decorator', difficulty: 'Medium', score: 250, testCasesCount: 20, tags: ['Decorators', 'Metaprogramming'] },
        { id: 'p-306', title: 'Role-Based Authorization Function Guard', difficulty: 'Medium', score: 220, testCasesCount: 16, tags: ['Decorators', 'Security'] },
      ],
    },
    {
      id: '2-6',
      title: 'functools.lru_cache & Dynamic Programming Memoization',
      type: 'lab',
      duration: '40 mins',
      problemTag: '12 Tests',
      importantNotes: ['@lru_cache(maxsize=None) caches recursive calls in O(1) hash maps, transforming exponential O(2^N) recursions to linear O(N).'],
      problems: [
        { id: 'p-307', title: 'Climbing Stairs: Memoized DP', difficulty: 'Easy', score: 120, testCasesCount: 15, tags: ['Dynamic Programming', 'Memoization'] },
        { id: 'p-308', title: 'Coin Change Minimum Denominations', difficulty: 'Medium', score: 280, testCasesCount: 26, tags: ['Dynamic Programming', 'Optimization'] },
      ],
    },
    {
      id: '2-7',
      title: 'Recursion, Call Stack Depth & Base Case Design',
      type: 'lab',
      duration: '32 mins',
      problemTag: '8 Tests',
      importantNotes: ['Python default recursion limit is 1000; use sys.setrecursionlimit(200000) for deep graph traversals or convert to iteration.'],
      problems: [
        { id: 'p-309', title: 'Reverse Linked List (Recursive)', difficulty: 'Easy', score: 140, testCasesCount: 14, tags: ['Recursion', 'Linked List'] },
        { id: 'p-310', title: 'Permutations & Combinations Backtracking', difficulty: 'Medium', score: 320, testCasesCount: 24, tags: ['Backtracking', 'Recursion'] },
      ],
    },
    {
      id: '2-8',
      title: 'Module 3 Capstone: Memoized Expression Evaluator',
      type: 'quiz',
      duration: '50 mins',
      problemTag: 'Graded',
      importantNotes: ['Capstone evaluating closures, custom decorators, and memoized recursive parsing for algebraic expressions.'],
      problems: [
        { id: 'p-311', title: 'Capstone: AST Expression Evaluator & Optimizer', difficulty: 'Hard', score: 480, testCasesCount: 40, tags: ['Capstone', 'AST', 'Functional'] },
      ],
    },
  ],
  3: [
    {
      id: '3-0',
      title: 'Classes, Objects, __init__ & the Self Parameter',
      type: 'guide',
      duration: '18 mins',
      importantNotes: ['Classes act as blueprints; "self" is explicitly passed to represent the instance currently being operated on.'],
      problems: [
        { id: 'p-401', title: 'Bank Account Transaction Ledger Model', difficulty: 'Easy', score: 120, testCasesCount: 12, tags: ['OOP', 'Classes'] },
      ],
    },
    {
      id: '3-1',
      title: 'Encapsulation, Name Mangling & Property Getters',
      type: 'reading',
      duration: '22 mins',
      importantNotes: ['Leading double underscores (__var) trigger name mangling (_ClassName__var) to prevent accidental subclass overrides.'],
    },
    {
      id: '3-2',
      title: 'Inheritance, Polymorphism & super() Resolution',
      type: 'guide',
      duration: '25 mins',
      importantNotes: ['Python uses C3 Linearization (Method Resolution Order, MRO) to resolve diamond inheritance hierarchies deterministically.'],
      problems: [
        { id: 'p-402', title: 'Plugin Hook Architecture with Mixins', difficulty: 'Medium', score: 260, testCasesCount: 18, tags: ['OOP', 'MRO'] },
      ],
    },
    {
      id: '3-3',
      title: 'Streaming File I/O: Buffers, JSON & CSV Serializers',
      type: 'lab',
      duration: '30 mins',
      problemTag: '8 Tests',
      importantNotes: ['Always use "with open(...) as f:" context managers to ensure immediate file descriptor release.'],
      problems: [
        { id: 'p-403', title: 'Streaming JSON Log Aggregator', difficulty: 'Medium', score: 270, testCasesCount: 22, tags: ['I/O', 'JSON'] },
      ],
    },
    {
      id: '3-4',
      title: 'Defensive Programming: Custom Exceptions & Context Handlers',
      type: 'guide',
      duration: '18 mins',
      importantNotes: ['Derive custom domain exceptions from Exception (not BaseException) to preserve system interrupts.'],
      problems: [
        { id: 'p-404', title: 'Custom Database Transaction Rollback Handler', difficulty: 'Medium', score: 250, testCasesCount: 16, tags: ['Context Managers', 'Exceptions'] },
      ],
    },
    {
      id: '3-5',
      title: 'Design & Implement High-Performance Stack & Queue',
      type: 'lab',
      duration: '40 mins',
      problemTag: '10 Tests',
      importantNotes: ['collections.deque provides O(1) append and pop on both ends; lists are O(N) for popleft().'],
      problems: [
        { id: 'p-405', title: 'Min Stack with O(1) Minimum Retrieval', difficulty: 'Medium', score: 280, testCasesCount: 25, tags: ['Stack', 'Design'] },
        { id: 'p-406', title: 'Implement Queue Using Two Stacks', difficulty: 'Easy', score: 150, testCasesCount: 18, tags: ['Queue', 'Stack'] },
      ],
    },
    {
      id: '3-6',
      title: 'Two Sum & Subarray Sum Equals K Optimization',
      type: 'lab',
      duration: '45 mins',
      problemTag: '15 Tests',
      importantNotes: ['Prefix sum hash map stores count of previously seen cumulative sums to find matching subarrays in O(N).'],
      problems: [
        { id: 'p-407', title: 'Continuous Subarray Sum Multiple of K', difficulty: 'Medium', score: 320, testCasesCount: 28, tags: ['Hash Map', 'Prefix Sum', 'Math'] },
      ],
    },
    {
      id: '3-7',
      title: 'Final Capstone: Production Algorithmic Log Parser',
      type: 'quiz',
      duration: '60 mins',
      problemTag: 'Capstone',
      importantNotes: ['Full end-to-end challenge testing OOP data models, custom exceptions, stack tracking, and optimized hash search.'],
      problems: [
        { id: 'p-408', title: 'Production Distributed Log Parser & Anomaly Detector', difficulty: 'Hard', score: 500, testCasesCount: 45, tags: ['Capstone', 'System Design', 'Algorithms'] },
      ],
    },
  ],
};

export const normalizeLessonType = (rawType?: string): TopicItem['type'] => {
  const normalized = (rawType || '').toLowerCase().trim();
  if (normalized === 'code' || normalized === 'lab') return 'lab';
  if (normalized === 'quiz' || normalized === 'assessment') return 'quiz';
  if (normalized === 'guide' || normalized === 'tutorial') return 'guide';
  if (normalized === 'reading' || normalized === 'theory' || normalized === 'article') return 'reading';
  return 'reading';
};

export const getModuleTopicItems = (course: CourseDirectoryEntity, moduleIdx: number): TopicItem[] => {
  const completedSet = new Set<string>((course as any).completedLessonIds || []);

  // 1. From course.modules[idx].lessons
  const backendModule = course.modules && course.modules[moduleIdx];
  if (backendModule && Array.isArray(backendModule.lessons)) {
    return backendModule.lessons.map((lesson: any, lIdx: number) => {
      if (typeof lesson === 'string') {
        const inferredType: TopicItem['type'] = lIdx % 3 === 0 ? 'guide' : lIdx % 3 === 1 ? 'reading' : 'lab';
        return {
          id: `local-${moduleIdx}-${lIdx}`,
          title: lesson,
          type: inferredType,
          duration: `${15 + (lIdx * 3) % 20} mins`,
          isCompleted: false,
        };
      }
      const lid = lesson.id || `local-${moduleIdx}-${lIdx}`;
      return {
        id: lid,
        title: lesson.title || `Lesson ${lIdx + 1}`,
        type: normalizeLessonType(lesson.type),
        duration: lesson.duration || (lesson.durationMinutes ? `${lesson.durationMinutes} mins` : '15 mins'),
        summary: lesson.summary || lesson.description,
        problemTag: lesson.problemTag,
        importantNotes: lesson.importantNotes || lesson.keyTakeaways || [],
        content: lesson.content,
        quizMCQ: lesson.quizMCQ,
        codingProblem: lesson.codingProblem,
        quizAttempt: lesson.userProgress?.quizAttempt || lesson.quizAttempt,
        codeSubmission: lesson.userProgress?.codeSubmission || lesson.codeSubmission,
        userProgress: lesson.userProgress,
        isCompleted: Boolean(lesson.isCompleted || completedSet.has(lid)),
      };
    });
  }

  // 2. From course.levels
  if (course.levels && Array.isArray(course.levels)) {
    const allLevelModules = course.levels.flatMap((lvl: any) => lvl.modules || []);
    const levelMod = allLevelModules[moduleIdx];
    if (levelMod) {
      if (Array.isArray(levelMod.topics) && levelMod.topics.length > 0) {
        return levelMod.topics.map((t: any, tIdx: number) => ({
          id: `local-${moduleIdx}-${tIdx}`,
          title: typeof t === 'string' ? t : t.title || `Topic ${tIdx + 1}`,
          type: typeof t === 'string' ? (tIdx % 3 === 0 ? 'guide' : tIdx % 3 === 1 ? 'reading' : 'lab') : normalizeLessonType(t.type),
          duration: `${15 + (tIdx * 4) % 20} mins`,
        }));
      }
      if (Array.isArray(levelMod.lessons) && levelMod.lessons.length > 0) {
        return levelMod.lessons.map((l: any, lIdx: number) => ({
          id: `local-${moduleIdx}-${lIdx}`,
          title: typeof l === 'string' ? l : l.title || `Lesson ${lIdx + 1}`,
          type: typeof l === 'string' ? (lIdx % 3 === 0 ? 'guide' : lIdx % 3 === 1 ? 'reading' : 'lab') : normalizeLessonType(l.type),
          duration: `${15 + (lIdx * 4) % 20} mins`,
        }));
      }
    }
  }

  return [];
};

export const getBadgeForType = (type?: TopicItem['type']) => {
  switch (type) {
    case 'guide':
      return {
        label: 'Interactive Tutorial',
        icon: <MenuBookRoundedIcon sx={{ fontSize: 13 }} />,
        bg: '#EFF6FF',
        color: '#2563EB',
        border: '#DBEAFE',
      };
    case 'lab':
      return {
        label: 'Code Lab Sandbox',
        icon: <TerminalRoundedIcon sx={{ fontSize: 13 }} />,
        bg: '#ECFDF5',
        color: '#059669',
        border: '#A7F3D0',
      };
    case 'quiz':
      return {
        label: 'Milestone Assessment',
        icon: <AssignmentRoundedIcon sx={{ fontSize: 13 }} />,
        bg: '#FFFBEB',
        color: '#D97706',
        border: '#FDE68A',
      };
    case 'reading':
    default:
      return {
        label: 'Concept & Theory',
        icon: <MenuBookRoundedIcon sx={{ fontSize: 13 }} />,
        bg: '#F5F3FF',
        color: '#7C3AED',
        border: '#DDD6FE',
      };
  }
};
