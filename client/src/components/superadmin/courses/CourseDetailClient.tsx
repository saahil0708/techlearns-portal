'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Avatar,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  LinearProgress,
  TextField,
  InputAdornment,
  Divider,
  Collapse,
} from '@mui/material';
import Link from 'next/link';

// Icons
import { FluidArrowLeft } from '@/utils/fluid_arrow';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import NorthEastRoundedIcon from '@mui/icons-material/NorthEastRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CodeOffRoundedIcon from '@mui/icons-material/CodeOffRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded';
import MilitaryTechRoundedIcon from '@mui/icons-material/MilitaryTechRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';

import { useAppSelector } from '@/store/hooks';
import FloatingSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import ViewCertificateModal from '@/components/students/profile/ViewCertificateModal';
import { InteractiveWarpGrid } from '@/components/common/InteractiveWarpGrid';
import type { CourseDirectoryEntity } from '@/types/course';
import type { StudentCertification } from '@/types/student-profile';

interface CourseDetailClientProps {
  course: CourseDirectoryEntity;
  role?: 'superadmin' | 'student';
}

interface EnrolledStudent {
  id: string;
  name: string;
  handle: string;
  institution: string;
  enrolledDate: string;
  progressPct: number;
  completedLessons: number;
  quizScorePct: number;
  lastActive: string;
  status: 'In Progress' | 'Completed' | 'Inactive';
}

interface CourseAssignment {
  id: string;
  title: string;
  module: string;
  type: 'Coding Lab' | 'Quiz' | 'Project Evaluation';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  submissionsCount: number;
  avgScore: number;
  dueDate: string;
  status: 'Open' | 'Graded';
}

interface SubModuleProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  score: number;
  testCasesCount: number;
  tags?: string[];
}

interface TopicItem {
  id?: string;
  title: string;
  type: 'guide' | 'lab' | 'reading' | 'quiz';
  duration: string;
  summary?: string;
  problemTag?: string;
  importantNotes?: string[];
  problems?: SubModuleProblem[];
}

const pythonCatalog: Record<number, TopicItem[]> = {
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
          { id: 'p-201', title: 'Collatz Conjecture Step Simulator', difficulty: 'Easy', score: 100, testCasesCount: 10, tags: ['Loops', 'Math'] },
        ],
      },
      {
        id: '1-1',
        title: 'For Loops & The Lazy range() Iterator Protocol',
        type: 'reading',
        duration: '16 mins',
        importantNotes: ['The range(start, stop, step) protocol computes values on-demand in O(1) memory space regardless of range magnitude.'],
      },
      {
        id: '1-2',
        title: 'Nested Loops & Matrix / Pattern Generation',
        type: 'lab',
        duration: '30 mins',
        problemTag: '6 Tests',
        importantNotes: ['Nested loops have O(R × C) complexity; flatten 2D operations where single-pass indexing (r * cols + c) is applicable.'],
        problems: [
          { id: 'p-202', title: 'Matrix Diagonal Spiral Traversal', difficulty: 'Medium', score: 220, testCasesCount: 18, tags: ['Matrix', 'Loops'] },
        ],
      },
      {
        id: '1-3',
        title: 'Sieve of Eratosthenes & Prime Factorization',
        type: 'lab',
        duration: '35 mins',
        problemTag: '10 Tests',
        importantNotes: ['Sieve computes all primes up to N in O(N log log N) time; iterate multiples starting at i² to eliminate redundant checks.'],
        problems: [
          { id: 'p-203', title: 'Primes Up to N via Segmented Sieve', difficulty: 'Medium', score: 260, testCasesCount: 25, tags: ['Math', 'Sieve'] },
        ],
      },
      {
        id: '1-4',
        title: 'Bitwise Arithmetic: Parity, Masks & Bit Shifts',
        type: 'guide',
        duration: '20 mins',
        importantNotes: ['n & (n - 1) clears the lowest set bit in O(1) time; n & 1 evaluates parity faster than modulo n % 2.'],
        problems: [
          { id: 'p-204', title: 'Single Number in Array (XOR Invariant)', difficulty: 'Easy', score: 120, testCasesCount: 16, tags: ['Bit Manipulation'] },
          { id: 'p-205', title: 'Counting Bits in Range [0, N]', difficulty: 'Medium', score: 200, testCasesCount: 20, tags: ['Bit Manipulation', 'DP'] },
        ],
      },
      {
        id: '1-5',
        title: 'Gregorian Calendar & Leap Year Invariants',
        type: 'lab',
        duration: '22 mins',
        problemTag: '8 Tests',
        importantNotes: ['A year is leap if (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0).'],
        problems: [
          { id: 'p-206', title: 'Day of the Week Calculator (Zeller Rule)', difficulty: 'Easy', score: 130, testCasesCount: 14, tags: ['Math', 'Date'] },
        ],
      },
      {
        id: '1-6',
        title: 'Fibonacci Sequence & Memoization Warmup',
        type: 'lab',
        duration: '28 mins',
        problemTag: '7 Tests',
        importantNotes: ['Iterative state variables (a, b = b, a + b) compute the N-th Fibonacci number in O(N) time and O(1) auxiliary space.'],
        problems: [
          { id: 'p-207', title: 'Climbing Stairs (Dynamic Stepping)', difficulty: 'Easy', score: 100, testCasesCount: 15, tags: ['DP', 'Math'] },
        ],
      },
      {
        id: '1-7',
        title: 'Loop Invariants & Formal Complexity Analysis',
        type: 'reading',
        duration: '25 mins',
        importantNotes: ['Formulate loop invariants before writing nested scans to guarantee boundary correctness.'],
      },
      {
        id: '1-8',
        title: 'Module 2 Benchmark: Iterative Algorithms Drill',
        type: 'quiz',
        duration: '40 mins',
        problemTag: 'Graded',
        problems: [
          { id: 'p-208', title: 'Benchmark: Bitmask Subsequence Generator', difficulty: 'Hard', score: 380, testCasesCount: 30, tags: ['Bitmask', 'Iteration'] },
        ],
      },
    ],
    2: [
      {
        id: '2-0',
        title: 'First-Class Functions & Higher-Order Callables',
        type: 'guide',
        duration: '18 mins',
        importantNotes: ['Functions are first-class citizens and can be passed as arguments, returned, or assigned dynamically.'],
        problems: [
          { id: 'p-301', title: 'Custom Higher-Order Map & Filter Engine', difficulty: 'Easy', score: 120, testCasesCount: 12, tags: ['Functional', 'Callbacks'] },
        ],
      },
      {
        id: '2-1',
        title: 'Variadic Arguments (*args, **kwargs) & Unpacking',
        type: 'reading',
        duration: '15 mins',
        importantNotes: ['*args unpacks positional arguments into a tuple; **kwargs unpacks keyword arguments into a dictionary.'],
      },
      {
        id: '2-2',
        title: 'Namespaces: LEGB Scope & Closure Environments',
        type: 'lab',
        duration: '25 mins',
        problemTag: '5 Tests',
        importantNotes: ['LEGB lookup order: Local -> Enclosing -> Global -> Built-in. Use nonlocal to bind enclosing closure state.'],
        problems: [
          { id: 'p-302', title: 'Rate Limiting Function Decorator with Closures', difficulty: 'Medium', score: 250, testCasesCount: 18, tags: ['Closures', 'Decorators'] },
        ],
      },
      {
        id: '2-3',
        title: 'Recursion Mechanics: Call Stack & Base Cases',
        type: 'guide',
        duration: '22 mins',
        importantNotes: ['Every recursive invocation must have at least one reachable base case to prevent RecursionError stack overflow.'],
        problems: [
          { id: 'p-303', title: 'Recursive Tree Depth & Leaf Node Counter', difficulty: 'Easy', score: 130, testCasesCount: 15, tags: ['Recursion', 'Trees'] },
        ],
      },
      {
        id: '2-4',
        title: 'Array In-Place Mutability & Memory Slicing',
        type: 'lab',
        duration: '30 mins',
        problemTag: '8 Tests',
        importantNotes: ['arr[:] = new_vals replaces contents in-place without altering parent object references.'],
        problems: [
          { id: 'p-304', title: 'In-Place Array Duplicate Removal', difficulty: 'Easy', score: 110, testCasesCount: 14, tags: ['Two-Pointers', 'Arrays'] },
        ],
      },
      {
        id: '2-5',
        title: 'Hash Collision Handling & Dictionary Lookups',
        type: 'reading',
        duration: '20 mins',
        importantNotes: ['Open addressing with perturb hashing achieves O(1) lookups under <66% load factor.'],
      },
      {
        id: '2-6',
        title: 'Two-Pointer Technique: Palindrome & Reversals',
        type: 'lab',
        duration: '35 mins',
        problemTag: '9 Tests',
        importantNotes: ['Opposite-end two pointers (left, right) reduce sorted search space in O(N) time with O(1) space.'],
        problems: [
          { id: 'p-305', title: 'Container With Most Water', difficulty: 'Medium', score: 280, testCasesCount: 24, tags: ['Two-Pointers', 'Greedy'] },
          { id: 'p-306', title: '3Sum: Zero Triplet Permutations', difficulty: 'Medium', score: 320, testCasesCount: 30, tags: ['Two-Pointers', 'Arrays'] },
        ],
      },
      {
        id: '2-7',
        title: 'Tower of Hanoi: State Transitions & Tracer',
        type: 'lab',
        duration: '40 mins',
        problemTag: '14 Tests',
        importantNotes: ['Classic divide-and-conquer problem requiring 2^N - 1 moves.'],
        problems: [
          { id: 'p-307', title: 'Tower of Hanoi Sequence Generator', difficulty: 'Medium', score: 260, testCasesCount: 20, tags: ['Recursion'] },
        ],
      },
      {
        id: '2-8',
        title: 'Module 3 Mastery: Recursive Data Structures',
        type: 'quiz',
        duration: '45 mins',
        problemTag: 'Graded',
        problems: [
          { id: 'p-308', title: 'Mastery: Flatten Multi-Nested Data Structure', difficulty: 'Hard', score: 390, testCasesCount: 32, tags: ['Recursion', 'Data Structures'] },
        ],
      },
    ],
    3: [
      {
        id: '3-0',
        title: 'OOP Foundations: Classes, Instances & Dunder Methods',
        type: 'guide',
        duration: '24 mins',
        importantNotes: ['Implement __repr__, __str__, and __eq__ to make custom classes first-class objects in test assertions.'],
        problems: [
          { id: 'p-401', title: 'Vector2D & Vector3D Arithmetic Overloader', difficulty: 'Easy', score: 140, testCasesCount: 16, tags: ['OOP', 'Dunder'] },
        ],
      },
      {
        id: '3-1',
        title: 'Encapsulation, Property Decorators & Access Modifiers',
        type: 'reading',
        duration: '20 mins',
        importantNotes: ['Use @property and @setter for validated attributes without breaking public API interfaces.'],
      },
      {
        id: '3-2',
        title: 'Multiple Inheritance & Method Resolution Order (MRO)',
        type: 'lab',
        duration: '35 mins',
        problemTag: '6 Tests',
        importantNotes: ['C3 Linearization guarantees deterministic ancestor lookup in diamond inheritance structures.'],
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

const getModuleTopicItems = (course: CourseDirectoryEntity, moduleIdx: number): TopicItem[] => {
  const isPythonCourse = Boolean(
    course.slug?.toLowerCase().includes('python') ||
    course.code?.toLowerCase().includes('py') ||
    course.title?.toLowerCase().includes('python')
  );

  // 1. From course.modules[idx].lessons
  const backendModule = course.modules && course.modules[moduleIdx];
  if (backendModule && Array.isArray(backendModule.lessons) && backendModule.lessons.length > 0) {
    return backendModule.lessons.map((lesson: any, lIdx: number) => {
      if (typeof lesson === 'string') {
        return {
          id: `${moduleIdx}-${lIdx}`,
          title: lesson,
          type: (lIdx % 3 === 0 ? 'guide' : lIdx % 3 === 1 ? 'reading' : 'lab') as any,
          duration: `${15 + (lIdx * 3) % 20} mins`,
          problems: [
            {
              id: `p-${moduleIdx}-${lIdx}`,
              title: `${lesson} Practice Challenge`,
              difficulty: lIdx % 3 === 0 ? 'Easy' : lIdx % 3 === 1 ? 'Medium' : 'Hard',
              score: 100 + lIdx * 20,
              testCasesCount: 10 + lIdx * 2,
              tags: [course.category || 'Practice'],
            },
          ],
        };
      }
      return {
        id: lesson.id || `${moduleIdx}-${lIdx}`,
        title: lesson.title || `Lesson ${lIdx + 1}`,
        type: (lesson.type || (lIdx % 3 === 0 ? 'guide' : lIdx % 3 === 1 ? 'reading' : 'lab')) as any,
        duration: lesson.duration || (lesson.durationMinutes ? `${lesson.durationMinutes} mins` : '15 mins'),
        summary: lesson.summary || lesson.description,
        problemTag: lesson.problemTag,
        importantNotes: lesson.importantNotes || lesson.keyTakeaways || [],
        problems: lesson.problems || (lesson.practiceProblemsCount ? [
          {
            id: `p-${moduleIdx}-${lIdx}`,
            title: `${lesson.title || 'Lesson'} Practice`,
            difficulty: 'Medium',
            score: 150,
            testCasesCount: 12,
            tags: [course.category || 'Practice'],
          },
        ] : []),
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
          id: `${moduleIdx}-${tIdx}`,
          title: typeof t === 'string' ? t : t.title || `Topic ${tIdx + 1}`,
          type: (tIdx % 3 === 0 ? 'guide' : tIdx % 3 === 1 ? 'reading' : 'lab') as any,
          duration: `${15 + (tIdx * 4) % 20} mins`,
        }));
      }
      if (Array.isArray(levelMod.lessons) && levelMod.lessons.length > 0) {
        return levelMod.lessons.map((l: any, lIdx: number) => ({
          id: `${moduleIdx}-${lIdx}`,
          title: typeof l === 'string' ? l : l.title || `Lesson ${lIdx + 1}`,
          type: (lIdx % 3 === 0 ? 'guide' : lIdx % 3 === 1 ? 'reading' : 'lab') as any,
          duration: `${15 + (lIdx * 4) % 20} mins`,
        }));
      }
    }
  }

  // 3. If python course, show python catalog
  if (isPythonCourse && pythonCatalog[moduleIdx]) {
    return pythonCatalog[moduleIdx];
  }

  // 4. From course.moduleHighlights[moduleIdx].lessons
  const modHighlight = course.moduleHighlights && course.moduleHighlights[moduleIdx];
  if (modHighlight && typeof modHighlight.lessons === 'number' && modHighlight.lessons > 0) {
    return Array.from({ length: modHighlight.lessons }, (_, lIdx) => ({
      id: `${moduleIdx}-${lIdx}`,
      title: `${modHighlight.title} - Concept ${lIdx + 1}`,
      type: (lIdx % 3 === 0 ? 'guide' : lIdx % 3 === 1 ? 'reading' : 'lab') as any,
      duration: `${15 + (lIdx * 3) % 20} mins`,
      problems: [
        {
          id: `p-${moduleIdx}-${lIdx}`,
          title: `${modHighlight.title} Challenge ${lIdx + 1}`,
          difficulty: lIdx % 2 === 0 ? 'Easy' : 'Medium',
          score: 100 + lIdx * 20,
          testCasesCount: 10 + lIdx * 2,
          tags: [course.category || 'Practice'],
        },
      ],
    }));
  }

  return [
    {
      id: `${moduleIdx}-0`,
      title: `${modHighlight?.title || `Module ${moduleIdx + 1}`} Overview & Architecture`,
      type: 'guide',
      duration: '15 mins',
    },
  ];
};

const getBadgeForType = (type: TopicItem['type']) => {
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
    case 'reading':
      return {
        label: 'Concept & Theory',
        icon: <MenuBookRoundedIcon sx={{ fontSize: 13 }} />,
        bg: '#F5F3FF',
        color: '#7C3AED',
        border: '#DDD6FE',
      };
    case 'quiz':
      return {
        label: 'Milestone Assessment',
        icon: <AssignmentRoundedIcon sx={{ fontSize: 13 }} />,
        bg: '#FFFBEB',
        color: '#D97706',
        border: '#FDE68A',
      };
  }
};

export default function CourseDetailClient({
  course,
  role = 'superadmin',
}: CourseDetailClientProps) {
  const authUser = useAppSelector((state) => state.auth.user);
  const certStudentName = role === 'student' ? (authUser?.name || 'Student') : 'Your Name';
  const isStudent = role === 'student';
  const [activeTab, setActiveTab] = useState<string>('curriculum');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [labSearch, setLabSearch] = useState<string>('');
  const [selectedCert, setSelectedCert] = useState<StudentCertification | null>(null);

  // Module Accordion Collapse/Expand State
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    (course.moduleHighlights || []).forEach((_, idx) => {
      initial[idx] = idx === 0; // First module open by default
    });
    return initial;
  });

  const toggleModule = (idx: number) => {
    setExpandedModules((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const allExpanded = useMemo(() => {
    if (!course.moduleHighlights || course.moduleHighlights.length === 0) return false;
    return course.moduleHighlights.every((_, idx) => !!expandedModules[idx]);
  }, [course.moduleHighlights, expandedModules]);

  const toggleAllModules = () => {
    const nextVal = !allExpanded;
    const nextState: Record<number, boolean> = {};
    (course.moduleHighlights || []).forEach((_, idx) => {
      nextState[idx] = nextVal;
    });
    setExpandedModules(nextState);
  };

  // Sub-module (Lesson item) Notes & Problems expand state
  const [expandedSubModules, setExpandedSubModules] = useState<Record<string, boolean>>({});

  const toggleSubModule = (key: string) => {
    setExpandedSubModules((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const borderColor = '#E2E8F0';

  // Seeded Enrolled Students Dataset
  const enrolledStudents: EnrolledStudent[] = useMemo(
    () => [
      {
        id: 'stu-101',
        name: 'Alex Vance',
        handle: 'alex_v',
        institution: 'Stanford University',
        enrolledDate: 'Jan 15, 2025',
        progressPct: 94,
        completedLessons: Math.round(course.lessonsCount * 0.94),
        quizScorePct: 96,
        lastActive: '10 mins ago',
        status: 'In Progress',
      },
      {
        id: 'stu-102',
        name: 'Elena Rostova',
        handle: 'elena_code',
        institution: 'MIT EECS',
        enrolledDate: 'Jan 18, 2025',
        progressPct: 100,
        completedLessons: course.lessonsCount,
        quizScorePct: 98,
        lastActive: 'Yesterday',
        status: 'Completed',
      },
      {
        id: 'stu-103',
        name: 'Devon Miles',
        handle: 'devon_m',
        institution: 'IIT Delhi',
        enrolledDate: 'Jan 22, 2025',
        progressPct: 82,
        completedLessons: Math.round(course.lessonsCount * 0.82),
        quizScorePct: 88,
        lastActive: '2 hours ago',
        status: 'In Progress',
      },
      {
        id: 'stu-104',
        name: 'Marcus Brody',
        handle: 'marcus_b',
        institution: 'Oxford Computing',
        enrolledDate: 'Feb 02, 2025',
        progressPct: 65,
        completedLessons: Math.round(course.lessonsCount * 0.65),
        quizScorePct: 84,
        lastActive: '3 days ago',
        status: 'In Progress',
      },
      {
        id: 'stu-105',
        name: 'Sarah Chen',
        handle: 'schen_ai',
        institution: 'UC Berkeley',
        enrolledDate: 'Feb 10, 2025',
        progressPct: 45,
        completedLessons: Math.round(course.lessonsCount * 0.45),
        quizScorePct: 90,
        lastActive: '5 hours ago',
        status: 'In Progress',
      },
      {
        id: 'stu-106',
        name: 'Kenji Takahashi',
        handle: 'kenji_t',
        institution: 'Tokyo Tech',
        enrolledDate: 'Feb 14, 2025',
        progressPct: 20,
        completedLessons: Math.round(course.lessonsCount * 0.2),
        quizScorePct: 75,
        lastActive: '1 week ago',
        status: 'Inactive',
      },
    ],
    [course]
  );

  // Seeded Assignments Dataset
  const courseAssignments: CourseAssignment[] = useMemo(
    () => [
      {
        id: 'lab-01',
        title: 'Lab 1: Asymptotic Complexity & Benchmarking Harness',
        module: 'Module 1: Foundations & Architecture',
        type: 'Coding Lab',
        difficulty: 'Easy',
        submissionsCount: 1420,
        avgScore: 92,
        dueDate: 'Feb 15, 2025',
        status: 'Open',
      },
      {
        id: 'lab-02',
        title: 'Lab 2: Lock-Free Concurrent Queue Implementation',
        module: 'Module 2: Core Data Structures',
        type: 'Coding Lab',
        difficulty: 'Medium',
        submissionsCount: 1180,
        avgScore: 84,
        dueDate: 'Feb 28, 2025',
        status: 'Open',
      },
      {
        id: 'lab-03',
        title: 'Midterm Quiz: Protocol Proofs & State Machine Invariants',
        module: 'Module 3: Consensus & Protocols',
        type: 'Quiz',
        difficulty: 'Medium',
        submissionsCount: 1250,
        avgScore: 88,
        dueDate: 'Mar 10, 2025',
        status: 'Open',
      },
      {
        id: 'lab-04',
        title: 'Capstone Evaluation: High-Throughput Sharded Cluster Runner',
        module: 'Module 4: Capstone Architecture',
        type: 'Project Evaluation',
        difficulty: 'Hard',
        submissionsCount: 890,
        avgScore: 79,
        dueDate: 'Apr 01, 2025',
        status: 'Open',
      },
    ],
    []
  );

  const filteredStudents = enrolledStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.handle.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.institution.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredLabs = courseAssignments.filter(
    (l) =>
      l.title.toLowerCase().includes(labSearch.toLowerCase()) ||
      l.module.toLowerCase().includes(labSearch.toLowerCase())
  );

  const getModuleProblemsCount = (mod: any, idx: number, topics: TopicItem[]) => {
    const problemsInTopics = topics.reduce((acc, t) => acc + (t.problems?.length || 0), 0);
    if (problemsInTopics > 0) return problemsInTopics;
    if (typeof mod.lessons === 'number') return mod.lessons * 2;
    return 10;
  };

  const totalProblemsCount = useMemo(() => {
    if (course.moduleHighlights && course.moduleHighlights.length > 0) {
      return course.moduleHighlights.reduce((total, mod, idx) => {
        const topics = getModuleTopicItems(course, idx);
        return total + getModuleProblemsCount(mod, idx, topics);
      }, 0);
    }
    return 40;
  }, [course]);

  const learningItems = useMemo(() => {
    if (course.whatYouWillLearn && course.whatYouWillLearn.length > 0) {
      return course.whatYouWillLearn.map((item: any) => typeof item === 'string' ? item : item.title || item.description);
    }
    return [
      `Learn ${course.category || course.title} Syntax & Core Fundamentals`,
      'Problem Solving with Algorithmic Patterns',
      'Practice Conditionals, Loops & Recursion',
      '500 to 1350 Difficulty Rating Coding Labs',
      'Object-Oriented Programming (OOP) & Modularity',
      'Automated Sandbox Runner with Instant Verdicts',
    ];
  }, [course]);

  const innerContent = (
    <Box sx={{ maxWidth: 1440, width: '100%', mx: 'auto', px: role === 'student' ? 0 : { xs: 2, sm: 3, md: 4.5 }, display: 'flex', flexDirection: 'column', gap: 3.5, pb: { xs: 6, md: 8 } }}>
      {/* Breadcrumb & Global Action Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        {/* Breadcrumb Navigation Trail */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            component={Link}
            href={role === 'student' ? '/courses' : '/superadmin/courses'}
            sx={{
              color: '#64748B',
              fontSize: '0.86rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'color 0.15s ease',
              '&:hover': { color: '#2563EB' },
            }}
          >
            Courses
          </Typography>
          <Typography sx={{ color: '#CBD5E1', fontSize: '0.86rem' }}>/</Typography>
          <Typography
            sx={{
              color: '#0F172A',
              fontSize: '0.86rem',
              fontWeight: 700,
              maxWidth: { xs: 240, sm: 380, md: 500 },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {course.title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: '#FFFFFF',
              color: '#475569',
              borderColor: borderColor,
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.84rem',
              px: 2.2,
              py: 0.7,
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1', color: '#0F172A' },
            }}
          >
            Export Syllabus (.pdf)
          </Button>
          <Button
            variant="contained"
            component={Link}
            href={`/courses/${course.slug || course.id}?lesson=0-0`}
            startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 19 }} />}
            sx={{
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              px: 2.5,
              py: 0.7,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)',
              },
            }}
          >
            Start Course
          </Button>
        </Box>
      </Box>

      {/* 1. Ultra-Luxury Deep Sapphire Hero Banner with Interactive Elastic Warp Grid */}
      <Box
            sx={{
              position: 'relative',
              borderRadius: '28px',
              overflow: 'hidden',
              bgcolor: '#07152E',
              backgroundImage: `
                radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 0% 100%, rgba(99, 102, 241, 0.25) 0%, transparent 50%),
                linear-gradient(135deg, #071329 0%, #0C234F 60%, #153272 100%)
              `,
              p: { xs: 3, sm: 4, md: 5 },
              boxShadow: '0 12px 36px rgba(11, 34, 74, 0.16)',
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', lg: 'center' },
              gap: 4,
            }}
          >
            {/* Interactive Gravitational Warp Grid Canvas */}
            <InteractiveWarpGrid
              gridSize={36}
              warpRadius={220}
              warpStrength={55}
              lineColor="rgba(147, 197, 253, 0.22)"
              glowColor="rgba(59, 130, 246, 0.42)"
            />

            {/* Ambient vignette overlay */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: 'radial-gradient(ellipse at center, transparent 40%, rgba(7, 19, 41, 0.4) 100%)',
                zIndex: 0,
              }}
            />

            {/* Hero Left Content */}
            <Box sx={{ position: 'relative', zIndex: 1, flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Live Accreditation Tag */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <VerifiedRoundedIcon sx={{ fontSize: 17, color: '#10B981' }} />
                <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.01em' }}>
                  Standardized Academic Accreditation
                </Typography>
              </Box>

              {/* Title */}
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.85rem', sm: '2.4rem', md: '2.8rem' },
                  letterSpacing: '-0.03em',
                  color: '#FFFFFF',
                  lineHeight: 1.2,
                }}
              >
                {course.title}
              </Typography>

              {/* Description */}
              <Typography
                sx={{
                  color: '#CBD5E1',
                  fontSize: { xs: '0.95rem', md: '1.02rem' },
                  lineHeight: 1.65,
                  maxWidth: 780,
                  fontWeight: 450,
                }}
              >
                {course.description}
              </Typography>

              {/* Badges Row */}
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, pt: 0.5 }}>
                {/* Certificate Pill */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.8,
                    py: 0.7,
                    borderRadius: '9999px',
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#FFFFFF',
                  }}
                >
                  <WorkspacePremiumRoundedIcon sx={{ fontSize: 18, color: '#FCD34D' }} />
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>
                    Verified Certificate Included
                  </Typography>
                </Box>

                {/* Star Rating Badge */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.6,
                    py: 0.65,
                    borderRadius: '9999px',
                    bgcolor: '#F59E0B',
                    color: '#0F172A',
                    fontWeight: 800,
                  }}
                >
                  <StarRoundedIcon sx={{ fontSize: 18, color: '#0F172A' }} />
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 800 }}>
                    4.9
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: '#1E293B', fontWeight: 700 }}>
                    (188.2k reviews)
                  </Typography>
                </Box>

                {/* Sandbox Tag */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.6,
                    py: 0.65,
                    borderRadius: '9999px',
                    bgcolor: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: '#A7F3D0',
                  }}
                >
                  <BoltRoundedIcon sx={{ fontSize: 17, color: '#34D399' }} />
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>
                    Instant GCC/CPython Execution
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Hero Right: Modern White Course Snapshot Card */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                width: { xs: '100%', sm: 380, lg: 410 },
                flexShrink: 0,
                borderRadius: '24px',
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                p: { xs: 2.75, md: 3.25 },
                display: 'flex',
                flexDirection: 'column',
                gap: 2.25,
                boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.9) inset',
              }}
            >
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ color: '#0F172A', fontWeight: 900, fontSize: '1.02rem', letterSpacing: '-0.01em' }}>
                    Course Snapshot
                  </Typography>
                  <Typography sx={{ color: '#64748B', fontSize: '0.78rem', fontWeight: 500 }}>
                    Self-paced developer curriculum
                  </Typography>
                </Box>
                <Chip
                  label="All Levels"
                  size="small"
                  sx={{
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    border: '1px solid #DBEAFE',
                    fontWeight: 750,
                    fontSize: '0.72rem',
                    height: 24,
                  }}
                />
              </Box>

              {/* Structured Key Specs List */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {/* Modules Spec */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.25, px: 1.5, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                      <LayersRoundedIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 650, color: '#1E293B' }}>
                      Curriculum Units
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A' }}>
                    {course.modulesCount} Modules
                  </Typography>
                </Box>

                {/* Duration Spec */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.25, px: 1.5, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
                      <AccessTimeRoundedIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 650, color: '#1E293B' }}>
                      Learning Content
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A' }}>
                    {course.durationHours} Hours
                  </Typography>
                </Box>

                {/* Problems Spec */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.25, px: 1.5, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                      <TerminalRoundedIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 650, color: '#1E293B' }}>
                      Coding Labs & Tests
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A' }}>
                    {totalProblemsCount} Labs
                  </Typography>
                </Box>
              </Box>

              {/* Progress Bar & Primary Action */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, pt: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                    Mastery Progress
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: '#2563EB', fontWeight: 750 }}>
                    0 of {totalProblemsCount} solved (0%)
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={0}
                  sx={{
                    height: 7,
                    borderRadius: '9999px',
                    bgcolor: '#F1F5F9',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #2563EB 0%, #38BDF8 100%)',
                      borderRadius: '9999px',
                    },
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  component={Link}
                  href="/problems"
                  startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 20 }} />}
                  sx={{
                    mt: 0.5,
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    textTransform: 'none',
                    borderRadius: '14px',
                    py: 1.25,
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 8px 20px rgba(37, 99, 235, 0.45)',
                    },
                  }}
                >
                  Start Course Learning
                </Button>
              </Box>
            </Box>
          </Box>

          {/* 2. Main Two-Column Architectural Layout */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              gap: 3.5,
              alignItems: 'flex-start',
            }}
          >
            {/* LEFT COLUMN: What You'll Learn + Curriculum Units / Workspace Tabs */}
            <Box sx={{ flex: 1, minWidth: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              {/* Card 1: What You'll Learn - Clean & Concise */}
              <Card
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: '20px',
                  bgcolor: '#FFFFFF',
                  border: `1px solid ${borderColor}`,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.25 }}>
                  <LightbulbRoundedIcon sx={{ color: '#2563EB', fontSize: 24 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.08rem' }}>
                    What you'll learn
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                    rowGap: 1.75,
                    columnGap: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckRoundedIcon sx={{ color: '#2563EB', fontSize: 20 }} />
                    <Typography sx={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
                      Learn {course.category} Syntax & Core Fundamentals
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckRoundedIcon sx={{ color: '#2563EB', fontSize: 20 }} />
                    <Typography sx={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
                      Problem Solving with Algorithmic Patterns
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckRoundedIcon sx={{ color: '#2563EB', fontSize: 20 }} />
                    <Typography sx={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
                      Practice Conditionals, Loops & Recursion
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckRoundedIcon sx={{ color: '#2563EB', fontSize: 20 }} />
                    <Typography sx={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
                      500 to 1350 Difficulty Rating Coding Labs
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckRoundedIcon sx={{ color: '#2563EB', fontSize: 20 }} />
                    <Typography sx={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
                      Object-Oriented Programming (OOP) & Modularity
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckRoundedIcon sx={{ color: '#2563EB', fontSize: 20 }} />
                    <Typography sx={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
                      Automated Sandbox Runner with Instant Verdicts
                    </Typography>
                  </Box>
                </Box>
              </Card>

              {/* Card 2: 3 Workspace Navigation Tabs */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: '24px',
                  bgcolor: '#FFFFFF',
                  border: `1px solid ${borderColor}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  overflow: 'hidden',
                }}
              >
                {/* Tabs Strip */}
                <Box sx={{ borderBottom: `1px solid ${borderColor}`, px: 3, pt: 1, bgcolor: '#FFFFFF' }}>
                  <Tabs
                    value={activeTab}
                    onChange={(_, val) => setActiveTab(val)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      minHeight: 52,
                      '& .MuiTabs-indicator': {
                        backgroundColor: '#2563EB',
                        height: 3,
                        borderRadius: '3px 3px 0 0',
                      },
                      '& .MuiTabs-flexContainer': {
                        gap: 2,
                      },
                    }}
                  >
                    <Tab
                      value="curriculum"
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <LayersRoundedIcon sx={{ fontSize: 19 }} />
                          <span>Curriculum & Timeline</span>
                          <Chip
                            label={course.modulesCount}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              bgcolor: activeTab === 'curriculum' ? '#EFF6FF' : '#F1F5F9',
                              color: activeTab === 'curriculum' ? '#2563EB' : '#64748B',
                            }}
                          />
                        </Box>
                      }
                      sx={{ textTransform: 'none', fontWeight: activeTab === 'curriculum' ? 800 : 600, fontSize: '0.9rem', color: activeTab === 'curriculum' ? '#2563EB !important' : '#64748B' }}
                    />

                    {!isStudent && (
                      <Tab
                        value="students"
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <PeopleAltRoundedIcon sx={{ fontSize: 19 }} />
                            <span>Enrolled Students</span>
                            <Chip
                              label={enrolledStudents.length}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                bgcolor: activeTab === 'students' ? '#EFF6FF' : '#F1F5F9',
                                color: activeTab === 'students' ? '#2563EB' : '#64748B',
                              }}
                            />
                          </Box>
                        }
                        sx={{ textTransform: 'none', fontWeight: activeTab === 'students' ? 800 : 600, fontSize: '0.9rem', color: activeTab === 'students' ? '#2563EB !important' : '#64748B' }}
                      />
                    )}

                    <Tab
                      value="labs"
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <CodeRoundedIcon sx={{ fontSize: 19 }} />
                          <span>Labs & Quizzes</span>
                          <Chip
                            label={courseAssignments.length}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              bgcolor: activeTab === 'labs' ? '#EFF6FF' : '#F1F5F9',
                              color: activeTab === 'labs' ? '#2563EB' : '#64748B',
                            }}
                          />
                        </Box>
                      }
                      sx={{ textTransform: 'none', fontWeight: activeTab === 'labs' ? 800 : 600, fontSize: '0.9rem', color: activeTab === 'labs' ? '#2563EB !important' : '#64748B' }}
                    />
                  </Tabs>
                </Box>

                {/* TAB 0: Curriculum & Detailed Topic Steppers */}
                {activeTab === 'curriculum' && (
                  <Box sx={{ p: { xs: 2.5, md: 3.5 }, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
                          Curriculum Units Breakdown
                        </Typography>
                        <Typography sx={{ color: '#64748B', fontSize: '0.84rem' }}>
                          Step-by-step modular lessons with interactive tutorials, sandbox code labs, and milestone assessments.
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        <Button
                          variant="outlined"
                          onClick={toggleAllModules}
                          startIcon={
                            allExpanded ? (
                              <KeyboardArrowUpRoundedIcon sx={{ fontSize: 18 }} />
                            ) : (
                              <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />
                            )
                          }
                          sx={{
                            borderRadius: '9999px',
                            borderColor: '#E2E8F0',
                            color: '#475569',
                            bgcolor: '#F8FAFC',
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            px: 2,
                            py: 0.65,
                            boxShadow: 'none',
                            '&:hover': {
                              borderColor: '#CBD5E1',
                              bgcolor: '#F1F5F9',
                              color: '#0F172A',
                            },
                          }}
                        >
                          {allExpanded ? 'Collapse All Units' : 'Expand All Units'}
                        </Button>
                        <Button
                          variant="contained"
                          component={Link}
                          href="/problems"
                          startIcon={<PlayCircleOutlineRoundedIcon />}
                          sx={{
                            borderRadius: '9999px',
                            bgcolor: '#2563EB',
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            px: 2.5,
                            py: 0.7,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: '#1D4ED8', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' },
                          }}
                        >
                          Start Module 1
                        </Button>
                      </Box>
                    </Box>

                    {/* Modular Units Stream - Flat Clean List with Underlines */}
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      {course.moduleHighlights.map((mod, idx) => {
                        const topicItems = getModuleTopicItems(course, idx);
                        const modLessonCount = typeof mod.lessons === 'number' ? mod.lessons : topicItems.length;
                        const problemsCount = getModuleProblemsCount(mod, idx, topicItems);
                        const isExpanded = !!expandedModules[idx];
                        const firstLessonKey = topicItems[0]?.id || `${idx}-0`;
                        const isLast = idx === course.moduleHighlights.length - 1;

                        return (
                          <Box
                            key={idx}
                            sx={{
                              borderBottom: isLast ? 'none' : '1px solid #E2E8F0',
                              transition: 'all 0.2s ease',
                              py: { xs: 1.5, md: 2 },
                            }}
                          >
                            {/* Module Header Bar */}
                            <Box
                              onClick={() => toggleModule(idx)}
                              sx={{
                                py: { xs: 1.5, md: 2 },
                                px: { xs: 1, md: 2 },
                                borderRadius: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 2,
                                bgcolor: isExpanded ? '#F8FAFC' : 'transparent',
                                transition: 'background-color 0.2s ease',
                                '&:hover': {
                                  bgcolor: '#F8FAFC',
                                },
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.25, flex: 1, minWidth: 240 }}>
                                {/* Module Number Badge */}
                                <Box
                                  sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: '12px',
                                    bgcolor: isExpanded ? '#2563EB' : '#EFF6FF',
                                    border: isExpanded ? '1px solid #2563EB' : '1px solid #BFDBFE',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 900,
                                    fontSize: '1.05rem',
                                    color: isExpanded ? '#FFFFFF' : '#2563EB',
                                    flexShrink: 0,
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  0{idx + 1}
                                </Box>

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography
                                    sx={{
                                      fontWeight: 800,
                                      fontSize: { xs: '1.05rem', md: '1.18rem' },
                                      color: '#0F172A',
                                      letterSpacing: '-0.01em',
                                    }}
                                  >
                                    {mod.title}
                                  </Typography>
                                  <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.84rem', mt: 0.35 }}>
                                    Interactive Unit • {modLessonCount} Lessons • {problemsCount} Practice Problems
                                  </Typography>
                                </Box>
                              </Box>

                              {/* Module Header Actions: Single Start Button + Accordion Toggle */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Button
                                  variant="contained"
                                  component={Link}
                                  href={`/courses/${course.slug}?lesson=${firstLessonKey}`}
                                  onClick={(e) => e.stopPropagation()}
                                  startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 18 }} />}
                                  sx={{
                                    borderRadius: '9999px',
                                    bgcolor: '#2563EB',
                                    color: '#FFFFFF',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.84rem',
                                    px: 2.5,
                                    py: 0.7,
                                    boxShadow: 'none',
                                    '&:hover': {
                                      bgcolor: '#1D4ED8',
                                      boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
                                    },
                                  }}
                                >
                                  Start Module
                                </Button>

                                <Tooltip title={isExpanded ? 'Collapse module' : 'Expand module'}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleModule(idx);
                                    }}
                                    sx={{
                                      width: 36,
                                      height: 36,
                                      bgcolor: '#F1F5F9',
                                      color: '#475569',
                                      border: '1px solid #E2E8F0',
                                      borderRadius: '10px',
                                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                      '&:hover': {
                                        bgcolor: '#E2E8F0',
                                        color: '#0F172A',
                                      },
                                    }}
                                  >
                                    <KeyboardArrowDownRoundedIcon sx={{ fontSize: 20 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>

                            {/* Collapsible Sub-modules Accordion with Roadmap Timeline Track */}
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit={false}>
                              <Box sx={{ pt: 1, pb: 1.5, px: { xs: 0.5, md: 1 } }}>
                                {/* Roadmap Sub-modules Stream */}
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                  {topicItems.map((item, tIdx) => {
                                    const subKey = item.id || `${idx}-${tIdx}`;
                                    const isSubExpanded = !!expandedSubModules[subKey];
                                    const isSubLast = tIdx === topicItems.length - 1;

                                    return (
                                      <Box
                                        key={tIdx}
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'stretch',
                                          gap: 2,
                                          position: 'relative',
                                        }}
                                      >
                                        {/* Left: Roadmap Timeline Track & Waypoint Node */}
                                        <Box
                                          sx={{
                                            width: 24,
                                            flexShrink: 0,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            position: 'relative',
                                          }}
                                        >
                                          {/* Waypoint Milestone Node */}
                                          <Box
                                            onClick={() => toggleSubModule(subKey)}
                                            sx={{
                                              width: 14,
                                              height: 14,
                                              borderRadius: '50%',
                                              bgcolor: isSubExpanded ? '#2563EB' : '#FFFFFF',
                                              border: `2px solid ${isSubExpanded ? '#2563EB' : '#CBD5E1'}`,
                                              boxShadow: isSubExpanded
                                                ? '0 0 0 4px rgba(37, 99, 235, 0.18)'
                                                : '0 0 0 2px #FFFFFF',
                                              zIndex: 2,
                                              flexShrink: 0,
                                              mt: 2.1,
                                              cursor: 'pointer',
                                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                              '&:hover': {
                                                borderColor: '#2563EB',
                                                transform: 'scale(1.2)',
                                              },
                                            }}
                                          />

                                          {/* Vertical Pathway Trail Line */}
                                          {!isSubLast && (
                                            <Box
                                              sx={{
                                                flex: 1,
                                                width: 2,
                                                bgcolor: isSubExpanded ? '#BFDBFE' : '#E2E8F0',
                                                my: 0.5,
                                                borderRadius: '1px',
                                                transition: 'background-color 0.2s ease',
                                              }}
                                            />
                                          )}
                                        </Box>

                                        {/* Right: Sub-module Content Row & Expandable Body */}
                                        <Box
                                          sx={{
                                            flex: 1,
                                            minWidth: 0,
                                            borderBottom: isSubLast ? 'none' : '1px solid #F1F5F9',
                                            pb: 0.5,
                                            mb: isSubLast ? 0 : 0.5,
                                          }}
                                        >
                                          {/* Sub-module Accordion Header */}
                                          <Box
                                            onClick={() => toggleSubModule(subKey)}
                                            sx={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'space-between',
                                              gap: 2,
                                              py: 1.4,
                                              px: 1.25,
                                              borderRadius: '8px',
                                              cursor: 'pointer',
                                              bgcolor: isSubExpanded ? '#F8FAFC' : 'transparent',
                                              transition: 'background-color 0.15s ease',
                                              '&:hover': {
                                                bgcolor: '#F8FAFC',
                                                '& .sub-title': { color: '#2563EB' },
                                              },
                                            }}
                                          >
                                            {/* Title */}
                                            <Typography
                                              className="sub-title"
                                              sx={{
                                                fontSize: '0.9rem',
                                                color: isSubExpanded ? '#2563EB' : '#1E293B',
                                                fontWeight: isSubExpanded ? 700 : 600,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                transition: 'color 0.15s ease',
                                                flex: 1,
                                                minWidth: 0,
                                              }}
                                            >
                                              {item.title}
                                            </Typography>

                                            {/* Right Meta: Duration & Expand Chevron */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                                              <Typography sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
                                                {item.duration}
                                              </Typography>

                                              <IconButton
                                                size="small"
                                                sx={{
                                                  p: 0.4,
                                                  color: '#64748B',
                                                  transform: isSubExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                  transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                }}
                                              >
                                                <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />
                                              </IconButton>
                                            </Box>
                                          </Box>

                                          {/* Sub-module Expanded Content: Study Summary Only */}
                                          <Collapse in={isSubExpanded} timeout="auto" unmountOnExit={false}>
                                            <Box
                                              sx={{
                                                p: 2,
                                                my: 1,
                                                borderRadius: '10px',
                                                bgcolor: '#F8FAFC',
                                                border: '1px solid #E2E8F0',
                                              }}
                                            >
                                              <Typography
                                                sx={{
                                                  fontSize: '0.85rem',
                                                  color: '#475569',
                                                  lineHeight: 1.65,
                                                  fontWeight: 500,
                                                }}
                                              >
                                                {item.summary ||
                                                  (item.importantNotes && item.importantNotes.length > 0
                                                    ? item.importantNotes.join(' ')
                                                    : `In this unit, you will study core syntax, structural paradigms, algorithmic foundations, and best practices for ${item.title}.`)}
                                              </Typography>
                                            </Box>
                                          </Collapse>
                                        </Box>
                                      </Box>
                                    );
                                  })}
                                </Box>
                              </Box>
                            </Collapse>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {/* TAB 1: Enrolled Students Roster (Strict Rule 10 Table) */}
                {!isStudent && activeTab === 'students' && (
                  <Box sx={{ p: { xs: 2.5, md: 3.5 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {/* Search Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                      <TextField
                        size="small"
                        placeholder="Search enrolled students by name, handle, or college..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                              </InputAdornment>
                            ),
                          },
                        }}
                        sx={{
                          minWidth: { xs: '100%', md: 380 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '9999px',
                            bgcolor: '#F8FAFC',
                            fontSize: '0.85rem',
                          },
                        }}
                      />
                      <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                        {filteredStudents.length} Students Enrolled
                      </Typography>
                    </Box>

                    {/* Structured Student Roster Table */}
                    <TableContainer sx={{ border: `1px solid ${borderColor}`, borderRadius: '16px', overflow: 'hidden' }}>
                      <Table sx={{ minWidth: 800 }}>
                        <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                          <TableRow>
                            <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', borderColor: '#E2E8F0' }}>
                              Student
                            </TableCell>
                            <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', borderColor: '#E2E8F0' }}>
                              Institution
                            </TableCell>
                            <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', borderColor: '#E2E8F0' }}>
                              Course Progress
                            </TableCell>
                            <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', borderColor: '#E2E8F0' }}>
                              Quiz Accuracy
                            </TableCell>
                            <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', borderColor: '#E2E8F0' }}>
                              Last Active
                            </TableCell>
                            <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', borderColor: '#E2E8F0' }}>
                              Status
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredStudents.map((stu) => (
                            <TableRow key={stu.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                              <TableCell sx={{ borderColor: '#E2E8F0' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Avatar sx={{ width: 34, height: 34, bgcolor: '#2563EB', fontWeight: 700, fontSize: '0.8rem', color: '#FFFFFF' }}>
                                    {stu.name.charAt(0)}
                                  </Avatar>
                                  <Box>
                                    <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.85rem' }}>
                                      {stu.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#2563EB', fontFamily: 'monospace' }}>
                                      @{stu.handle}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell sx={{ borderColor: '#E2E8F0' }}>
                                <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.82rem' }}>
                                  {stu.institution}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B' }}>
                                  Enrolled {stu.enrolledDate}
                                </Typography>
                              </TableCell>

                              <TableCell sx={{ borderColor: '#E2E8F0', minWidth: 160 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={stu.progressPct}
                                    sx={{
                                      flex: 1,
                                      height: 6,
                                      borderRadius: '9999px',
                                      bgcolor: '#F1F5F9',
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: stu.progressPct === 100 ? '#16A34A' : '#2563EB',
                                        borderRadius: '9999px',
                                      },
                                    }}
                                  />
                                  <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.76rem', width: 36 }}>
                                    {stu.progressPct}%
                                  </Typography>
                                </Box>
                                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem' }}>
                                  {stu.completedLessons} of {course.lessonsCount} lessons complete
                                </Typography>
                              </TableCell>

                              <TableCell sx={{ borderColor: '#E2E8F0' }}>
                                <Chip
                                  label={`${stu.quizScorePct}%`}
                                  size="small"
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: '0.72rem',
                                    borderRadius: '9999px',
                                    bgcolor: stu.quizScorePct >= 90 ? '#F0FDF4' : '#EFF6FF',
                                    color: stu.quizScorePct >= 90 ? '#16A34A' : '#2563EB',
                                    border: '1px solid',
                                    borderColor: stu.quizScorePct >= 90 ? '#BBF7D0' : '#BFDBFE',
                                  }}
                                />
                              </TableCell>

                              <TableCell sx={{ borderColor: '#E2E8F0' }}>
                                <Typography sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 500 }}>
                                  {stu.lastActive}
                                </Typography>
                              </TableCell>

                              <TableCell sx={{ borderColor: '#E2E8F0' }}>
                                <Chip
                                  label={stu.status}
                                  size="small"
                                  sx={{
                                    height: 22,
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    borderRadius: '9999px',
                                    bgcolor: stu.status === 'Completed' ? '#F0FDF4' : stu.status === 'In Progress' ? '#EFF6FF' : '#F1F5F9',
                                    color: stu.status === 'Completed' ? '#16A34A' : stu.status === 'In Progress' ? '#2563EB' : '#64748B',
                                    border: '1px solid',
                                    borderColor: stu.status === 'Completed' ? '#BBF7D0' : stu.status === 'In Progress' ? '#BFDBFE' : '#E2E8F0',
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* TAB 2: Coding Labs & Quizzes (Strict Rule 10 Table) */}
                {activeTab === 'labs' && (
                  <Box sx={{ p: { xs: 2.5, md: 3.5 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                      <TextField
                        size="small"
                        placeholder="Search labs, quizzes, and capstone evaluations..."
                        value={labSearch}
                        onChange={(e) => setLabSearch(e.target.value)}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                              </InputAdornment>
                            ),
                          },
                        }}
                        sx={{
                          minWidth: { xs: '100%', md: 380 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '9999px',
                            bgcolor: '#F8FAFC',
                            fontSize: '0.85rem',
                          },
                        }}
                      />
                      {!isStudent && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<AssignmentRoundedIcon />}
                          sx={{
                            borderRadius: '9999px',
                            bgcolor: '#2563EB',
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            px: 2.5,
                            py: 0.65,
                            '&:hover': { bgcolor: '#1D4ED8' },
                          }}
                        >
                          Author New Lab
                        </Button>
                      )}
                    </Box>

                    {/* Structured Labs Table */}
                    <TableContainer sx={{ border: `1px solid ${borderColor}`, borderRadius: '16px', overflow: 'hidden' }}>
                      <Table sx={{ minWidth: 800 }}>
                        <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                          <TableRow>
                            <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', borderColor: '#E2E8F0' }}>
                              Lab / Assignment Title
                            </TableCell>
                            <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', borderColor: '#E2E8F0' }}>
                              Evaluation Type
                            </TableCell>
                            <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', borderColor: '#E2E8F0' }}>
                              Difficulty
                            </TableCell>
                            <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', borderColor: '#E2E8F0' }}>
                              Submissions
                            </TableCell>
                            <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', borderColor: '#E2E8F0' }}>
                              Avg Score
                            </TableCell>
                            <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', borderColor: '#E2E8F0' }}>
                              Due Date
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredLabs.map((lab) => (
                            <TableRow key={lab.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                              <TableCell sx={{ borderColor: '#E2E8F0' }}>
                                <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.86rem' }}>
                                  {lab.title}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B' }}>
                                  {lab.module}
                                </Typography>
                              </TableCell>

                              <TableCell sx={{ borderColor: '#E2E8F0' }}>
                                <Chip
                                  label={lab.type}
                                  size="small"
                                  sx={{
                                    height: 22,
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    borderRadius: '9999px',
                                    bgcolor: '#EFF6FF',
                                    color: '#2563EB',
                                    border: '1px solid #BFDBFE',
                                  }}
                                />
                              </TableCell>

                              <TableCell sx={{ borderColor: '#E2E8F0' }}>
                                <Chip
                                  label={lab.difficulty}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    borderRadius: '9999px',
                                    bgcolor: lab.difficulty === 'Easy' ? '#F0FDF4' : lab.difficulty === 'Medium' ? '#EFF6FF' : '#FEF2F2',
                                    color: lab.difficulty === 'Easy' ? '#16A34A' : lab.difficulty === 'Medium' ? '#2563EB' : '#DC2626',
                                    border: '1px solid',
                                    borderColor: lab.difficulty === 'Easy' ? '#BBF7D0' : lab.difficulty === 'Medium' ? '#BFDBFE' : '#FECACA',
                                  }}
                                />
                              </TableCell>

                              <TableCell sx={{ borderColor: '#E2E8F0' }}>
                                <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.84rem' }}>
                                  {lab.submissionsCount.toLocaleString()}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem' }}>
                                  Sandbox Executions
                                </Typography>
                              </TableCell>

                              <TableCell sx={{ borderColor: '#E2E8F0' }}>
                                <Chip
                                  label={`${lab.avgScore}%`}
                                  size="small"
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: '0.72rem',
                                    borderRadius: '9999px',
                                    bgcolor: '#F0FDF4',
                                    color: '#16A34A',
                                    border: '1px solid #BBF7D0',
                                  }}
                                />
                              </TableCell>

                              <TableCell sx={{ borderColor: '#E2E8F0' }}>
                                <Typography sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
                                  {lab.dueDate}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </Card>
            </Box>

            {/* RIGHT COLUMN: Accredited Certificate Card & Faculty Accreditation */}
            <Box sx={{ width: { xs: '100%', lg: 390 }, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Card 1: Official Certificate Plaque */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: '24px',
                  bgcolor: '#FFFFFF',
                  border: `1px solid ${borderColor}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.5,
                }}
              >
                {/* Visual Certificate Frame Preview matching Reference */}
                <Box
                  sx={{
                    bgcolor: '#FAFAFA',
                    border: '2px solid #E2E8F0',
                    borderRadius: '18px',
                    p: { xs: 2.5, md: 3 },
                    textAlign: 'center',
                    position: 'relative',
                    boxShadow: 'inset 0 0 0 1px #F1F5F9',
                  }}
                >
                  {/* Outer Gold Foil Corner Accents */}
                  <Box sx={{ position: 'absolute', top: 6, left: 6, width: 8, height: 8, borderTop: '2px solid #D97706', borderLeft: '2px solid #D97706' }} />
                  <Box sx={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderTop: '2px solid #D97706', borderRight: '2px solid #D97706' }} />
                  <Box sx={{ position: 'absolute', bottom: 6, left: 6, width: 8, height: 8, borderBottom: '2px solid #D97706', borderLeft: '2px solid #D97706' }} />
                  <Box sx={{ position: 'absolute', bottom: 6, right: 6, width: 8, height: 8, borderBottom: '2px solid #D97706', borderRight: '2px solid #D97706' }} />

                  {/* Gold Medal Ribbon Seal at Top Center */}
                  <Box
                    sx={{
                      width: 54,
                      height: 54,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #FBBF24 0%, #D97706 70%, #B45309 100%)',
                      color: '#FFFFFF',
                      mx: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)',
                      border: '2px dashed #FEF3C7',
                      mb: 1.5,
                    }}
                  >
                    <WorkspacePremiumRoundedIcon sx={{ fontSize: 32, color: '#FFFFFF' }} />
                  </Box>

                  {/* Certificate Title */}
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.96rem',
                      color: '#0F172A',
                      mb: 1.5,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Certificate on Completion
                  </Typography>

                  {/* Verification Cryptographic Hash Pill */}
                  <Box
                    sx={{
                      bgcolor: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      py: 0.6,
                      px: 1.2,
                      mb: 2.5,
                    }}
                  >
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#2563EB', fontWeight: 700, letterSpacing: '0.04em' }}>
                      ID: CP-{course.code || 'CRS'}-0x8F92D
                    </Typography>
                  </Box>

                  {/* Signatures & Issuer Row */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      pt: 1.5,
                      borderTop: '1px solid #E2E8F0',
                    }}
                  >
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography sx={{ fontSize: '0.72rem', fontStyle: 'italic', fontWeight: 800, color: '#334155' }}>
                        Prof. Alan Turing
                      </Typography>
                      <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8' }}>
                        Curriculum Chair
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontSize: '0.72rem', fontStyle: 'italic', fontWeight: 800, color: '#334155' }}>
                        CodePlatform
                      </Typography>
                      <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8' }}>
                        Academic Board
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Certificate Details Text */}
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: '#0F172A',
                      mb: 0.5,
                    }}
                  >
                    Certification available
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: '0.86rem',
                      color: '#64748B',
                      lineHeight: 1.55,
                    }}
                  >
                    On completing all {course.modulesCount} modules and lab assessments in this roadmap, you'll receive an official verified certificate.
                  </Typography>
                </Box>

                {/* Action Button */}
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() =>
                    setSelectedCert({
                      id: `cert-${course.id}`,
                      title: course.title,
                      badgeCode: course.code,
                      language: course.category,
                      stars: 3,
                      issueDate: 'Academic Term 2025',
                      issuer: 'CodePlatform Academic Board & Faculty',
                      credentialId: `CP-${course.code || 'CRS'}-${course.id.slice(0, 6).toUpperCase()}`,
                      skills: course.tags,
                      score: '96%',
                      percentile: 'Top 5%',
                      proctoredBy: 'Stanford CS Evaluation Engine',
                      assessmentDuration: `${course.durationHours} Hours Total`,
                    })
                  }
                  startIcon={<WorkspacePremiumRoundedIcon sx={{ color: '#2563EB' }} />}
                  sx={{
                    borderColor: '#CBD5E1',
                    color: '#0F172A',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    borderRadius: '12px',
                    py: 1.1,
                    textTransform: 'none',
                    bgcolor: '#FFFFFF',
                    '&:hover': { borderColor: '#2563EB', bgcolor: '#EFF6FF', color: '#2563EB' },
                  }}
                >
                  Inspect Certificate Preview
                </Button>
              </Card>
            </Box>
          </Box>
        </Box>
  );

  return (
    <>
      {role === 'student' ? (
        <StudentAppLayout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
          {innerContent}
        </StudentAppLayout>
      ) : (
        <Box
          sx={{
            display: 'flex',
            minHeight: '100vh',
            bgcolor: '#F8FAFC',
            backgroundImage: `
              radial-gradient(ellipse at 15% 10%, rgba(37, 99, 235, 0.04) 0%, transparent 40%),
              radial-gradient(ellipse at 85% 20%, rgba(99, 102, 241, 0.03) 0%, transparent 45%),
              radial-gradient(ellipse at 50% 90%, rgba(14, 165, 233, 0.03) 0%, transparent 50%)
            `,
            color: '#0F172A',
            p: { xs: 1.5, sm: 2, md: 2.5 },
            pl: { xs: '82px', sm: '90px', md: '102px' },
            gap: { xs: 2, md: 3 },
          }}
        >
          {/* 1. Sidebar Navigation */}
          <FloatingSidebar />

          {/* Main Content Area */}
          <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Box sx={{ maxWidth: 1440, width: '100%', mx: 'auto', px: { xs: 2, sm: 3, md: 4.5 }, display: 'flex', flexDirection: 'column', gap: 3.5, pb: { xs: 6, md: 8 } }}>
              {/* 2. Top Header Navbar */}
              <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
              {innerContent}
            </Box>
          </Box>
        </Box>
      )}

      {/* Official Certificate Verification Modal */}
      <ViewCertificateModal
        open={Boolean(selectedCert)}
        onClose={() => setSelectedCert(null)}
        cert={selectedCert}
        studentName={certStudentName}
      />
    </>
  );
}
