'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/lib/api-service';

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
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded';
import MilitaryTechRoundedIcon from '@mui/icons-material/MilitaryTechRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

import { useAppSelector } from '@/store/hooks';
import FloatingSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import ViewCertificateModal from '@/components/students/profile/ViewCertificateModal';
import ModuleAuthoringModal from './ModuleAuthoringModal';
import LessonAuthoringModal, { LessonAuthoringPayload } from './LessonAuthoringModal';
import BulkImportCurriculumModal from './BulkImportCurriculumModal';
import EditCourseModal from './EditCourseModal';
import { DEFAULT_LEARNING_OUTCOMES } from './CreateCourseModal';
import { InteractiveWarpGrid } from '@/components/common/InteractiveWarpGrid';
import type { CourseDirectoryEntity, CourseCategory } from '@/types/course';
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
  codingProblem?: any;
  quizMCQ?: any;
  quizAttempt?: any;
  codeSubmission?: any;
  userProgress?: any;
  content?: string;
  isCompleted?: boolean;
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
  const completedSet = new Set<string>((course as any).completedLessonIds || []);

  // 1. From course.modules[idx].lessons
  const backendModule = course.modules && course.modules[moduleIdx];
  if (backendModule && Array.isArray(backendModule.lessons)) {
    return backendModule.lessons.map((lesson: any, lIdx: number) => {
      if (typeof lesson === 'string') {
        return {
          id: `local-${moduleIdx}-${lIdx}`,
          title: lesson,
          type: (lIdx % 3 === 0 ? 'guide' : lIdx % 3 === 1 ? 'reading' : 'lab') as any,
          duration: `${15 + (lIdx * 3) % 20} mins`,
          isCompleted: false,
        };
      }
      const lid = lesson.id || `local-${moduleIdx}-${lIdx}`;
      return {
        id: lid,
        title: lesson.title || `Lesson ${lIdx + 1}`,
        type: (lesson.type || 'reading') as any,
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
          type: (tIdx % 3 === 0 ? 'guide' : tIdx % 3 === 1 ? 'reading' : 'lab') as any,
          duration: `${15 + (tIdx * 4) % 20} mins`,
        }));
      }
      if (Array.isArray(levelMod.lessons) && levelMod.lessons.length > 0) {
        return levelMod.lessons.map((l: any, lIdx: number) => ({
          id: `local-${moduleIdx}-${lIdx}`,
          title: typeof l === 'string' ? l : l.title || `Lesson ${lIdx + 1}`,
          type: (lIdx % 3 === 0 ? 'guide' : lIdx % 3 === 1 ? 'reading' : 'lab') as any,
          duration: `${15 + (lIdx * 4) % 20} mins`,
        }));
      }
    }
  }

  return [];
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
  const router = useRouter();
  const toast = useToast();
  const authUser = useAppSelector((state) => state.auth.user);
  const certStudentName = role === 'student' ? (authUser?.name || 'Student') : 'Your Name';
  const isStudent = role === 'student';
  const [activeTab, setActiveTab] = useState<string>('curriculum');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [labSearch, setLabSearch] = useState<string>('');
  const [selectedCert, setSelectedCert] = useState<StudentCertification | null>(null);

  // Live Enrollment & Progress State
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);
  const [userProgressPct, setUserProgressPct] = useState<number>(0);

  const [liveCourse, setLiveCourse] = useState<CourseDirectoryEntity>(course);
  const [isStudioMode, setIsStudioMode] = useState<boolean>(!isStudent);
  const [isTogglingPublish, setIsTogglingPublish] = useState<boolean>(false);

  // Live Course Roster State
  const [liveRoster, setLiveRoster] = useState<EnrolledStudent[]>([]);
  const [hasFetchedRoster, setHasFetchedRoster] = useState<boolean>(false);
  const [rosterFetchError, setRosterFetchError] = useState<string | null>(null);
  const [isRosterLoading, setIsRosterLoading] = useState<boolean>(false);
  const [isExportingRoster, setIsExportingRoster] = useState<boolean>(false);
  const latestRosterRequestIdRef = useRef<number>(0);

  // Authoring Modals State
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState<boolean>(false);
  const [isAddModuleOpen, setIsAddModuleOpen] = useState<boolean>(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState<boolean>(false);
  const [moduleToEdit, setModuleToEdit] = useState<{ id?: string; title: string; description?: string; index?: number } | null>(null);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState<boolean>(false);
  const [targetModuleForLesson, setTargetModuleForLesson] = useState<{ id?: string; index: number; title: string } | null>(null);
  const [lessonToEdit, setLessonToEdit] = useState<{ id?: string; moduleIndex: number; lessonIndex: number; data: any } | null>(null);

  // Learning Outcomes Authoring State
  const [isEditOutcomesOpen, setIsEditOutcomesOpen] = useState<boolean>(false);
  const [editableOutcomes, setEditableOutcomes] = useState<string[]>([]);
  const [newOutcomeText, setNewOutcomeText] = useState<string>('');
  const [isSavingOutcomes, setIsSavingOutcomes] = useState<boolean>(false);

  const currentCourseIdRef = useRef<string>(course?.id || course?.slug || '');

  // Sync state if course prop changes and refresh live data on mount
  useEffect(() => {
    setLiveCourse(course);
    const targetCourseId = course?.id || course?.slug;
    currentCourseIdRef.current = targetCourseId || '';
    if (targetCourseId) {
      refreshLiveCourse(targetCourseId);
    }
  }, [course]);

  const refreshLiveCourse = async (targetId?: string) => {
    const courseIdToFetch = targetId || course?.id || liveCourse?.id || course?.slug;
    if (!courseIdToFetch) return;
    try {
      const fetched = await apiService.getCourseById(courseIdToFetch);
      // Ignore response if course prop has changed before it arrives
      if (
        currentCourseIdRef.current &&
        currentCourseIdRef.current !== courseIdToFetch &&
        fetched?.id !== currentCourseIdRef.current &&
        fetched?.slug !== currentCourseIdRef.current
      ) {
        return;
      }
      if (fetched) {
        setLiveCourse((prev) => {
          if (prev.id && fetched.id && prev.id !== fetched.id && prev.slug !== fetched.slug) {
            return prev;
          }
          return {
            ...prev,
            ...fetched,
            status: fetched.status === 'PUBLISHED' ? 'Published' : 'Draft',
            learningOutcomes: fetched.learningOutcomes || (Array.isArray(fetched.whatYouWillLearn) ? fetched.whatYouWillLearn.map((i: any) => typeof i === 'string' ? i : i.title || i.description) : prev.learningOutcomes),
            modules: fetched.modules || prev.modules || [],
            modulesCount: fetched.modules?.length ?? prev.modulesCount,
            lessonsCount: fetched.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) ?? prev.lessonsCount,
          };
        });
      }
    } catch (err) {
      console.warn('Could not reload fresh course data:', err);
    }
  };

  const handleOpenEditOutcomes = () => {
    setEditableOutcomes([...learningItems]);
    setNewOutcomeText('');
    setIsEditOutcomesOpen(true);
  };

  const handleAddEditableOutcome = (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e && 'key' in e && e.key !== 'Enter') return;
    if (e) e.preventDefault();
    const trimmed = newOutcomeText.trim();
    if (trimmed && !editableOutcomes.includes(trimmed)) {
      setEditableOutcomes([...editableOutcomes, trimmed]);
      setNewOutcomeText('');
    }
  };

  const handleRemoveEditableOutcome = (index: number) => {
    setEditableOutcomes(editableOutcomes.filter((_, idx) => idx !== index));
  };

  const handleResetEditableOutcomes = () => {
    const cat = liveCourse.category as CourseCategory;
    const defaults = DEFAULT_LEARNING_OUTCOMES[cat] || [
      `Learn ${liveCourse.category || liveCourse.title} Syntax & Core Fundamentals`,
      'Problem Solving with Algorithmic Patterns',
      'Practice Conditionals, Loops & Recursion',
      '500 to 1350 Difficulty Rating Coding Labs',
      'Object-Oriented Programming (OOP) & Modularity',
      'Automated Sandbox Runner with Instant Verdicts',
    ];
    setEditableOutcomes([...defaults]);
  };

  const handleSaveOutcomesToBackend = async () => {
    const cleaned = editableOutcomes.filter((item) => Boolean(item.trim()));
    if (cleaned.length === 0) {
      toast.warning('Please include at least one learning outcome point.', 'Validation');
      return;
    }

    setIsSavingOutcomes(true);
    try {
      await apiService.updateCourse(liveCourse.id || course.id, {
        learningOutcomes: cleaned,
      });

      setLiveCourse((prev) => ({
        ...prev,
        learningOutcomes: cleaned,
        whatYouWillLearn: cleaned.map((title) => ({ title, description: title })),
      }));

      setIsEditOutcomesOpen(false);
      toast.success('Course learning outcomes saved successfully!', 'Saved to Backend');
      await refreshLiveCourse();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save learning outcomes to server.', 'Save Failed');
    } finally {
      setIsSavingOutcomes(false);
    }
  };

  const handleTogglePublish = async () => {
    setIsTogglingPublish(true);
    try {
      const isCurrentlyPublished = liveCourse.status === 'Published' || (liveCourse.status as string) === 'PUBLISHED';
      if (isCurrentlyPublished) {
        await apiService.unpublishCourse(liveCourse.id || course.id);
        setLiveCourse((prev) => ({ ...prev, status: 'Draft' }));
        toast.info(`Course "${liveCourse.title}" unpublished to Draft status.`, 'Course Unpublished');
      } else {
        await apiService.publishCourse(liveCourse.id || course.id);
        setLiveCourse((prev) => ({ ...prev, status: 'Published' }));
        toast.success(`Course "${liveCourse.title}" published into active catalog!`, 'Course Published');
      }
      await refreshLiveCourse();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update course publishing status.', 'Status Update Failed');
    } finally {
      setIsTogglingPublish(false);
    }
  };

  const fetchLiveRoster = async () => {
    if (!liveCourse?.id || isStudent) return;
    const currentReqId = ++latestRosterRequestIdRef.current;
    setIsRosterLoading(true);
    setRosterFetchError(null);
    try {
      const rosterRes = await apiService.getCourseRoster(liveCourse.id || course.id, {
        search: studentSearch?.trim() || undefined,
        limit: 100,
      });
      if (currentReqId !== latestRosterRequestIdRef.current) return;
      const rawList: any[] = rosterRes?.items || (Array.isArray(rosterRes) ? rosterRes : []);
      const mapped: EnrolledStudent[] = rawList.map((r: any) => ({
        id: r.id || r.userId,
        name: r.name || r.user?.name || 'Student Member',
        handle: r.handle || r.user?.handle || r.email?.split('@')[0] || 'student',
        institution: r.institution || r.user?.institution?.name || 'Academic Institution',
        enrolledDate: r.enrolledDate ? new Date(r.enrolledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
        progressPct: r.progressPct ?? r.progress ?? 0,
        completedLessons: r.completedLessons ?? 0,
        quizScorePct: r.quizScorePct ?? r.score ?? 85,
        lastActive: r.lastActive ? new Date(r.lastActive).toLocaleDateString() : 'Active Today',
        status: r.status === 'COMPLETED' ? 'Completed' : r.status === 'DROPPED' ? 'Inactive' : 'In Progress',
      }));
      setLiveRoster(mapped);
      setHasFetchedRoster(true);
    } catch (err: any) {
      if (currentReqId !== latestRosterRequestIdRef.current) return;
      setLiveRoster([]);
      setHasFetchedRoster(true);
      setRosterFetchError(err?.message || 'Failed to load course roster.');
      toast.error(err?.message || 'Failed to load live course roster from server.', 'Roster Error');
    } finally {
      if (currentReqId === latestRosterRequestIdRef.current) {
        setIsRosterLoading(false);
      }
    }
  };

  useEffect(() => {
    if (activeTab === 'students' && !isStudent) {
      fetchLiveRoster();
    }
  }, [activeTab, studentSearch, liveCourse.id]);

  const handleExportRosterCsv = async () => {
    setIsExportingRoster(true);
    try {
      const blob = await apiService.exportCourseRosterCsv(liveCourse.id || course.id);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv;charset=utf-8;' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `course-${liveCourse.slug || liveCourse.id}-roster.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Course gradebook roster CSV exported successfully!', 'Roster Exported');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to export course roster CSV.', 'Export Failed');
    } finally {
      setIsExportingRoster(false);
    }
  };

  useEffect(() => {
    if (!isStudent) return;
    let isMounted = true;
    async function checkEnrollment() {
      try {
        const [enrolledList, me] = await Promise.all([
          apiService.getEnrolledCourses().catch(() => null),
          apiService.getMe().catch(() => null),
        ]);
        if (isMounted) {
          let found = false;
          let prog = 0;
          if (Array.isArray(enrolledList)) {
            const match = enrolledList.find(
              (e: any) =>
                e.courseId === course.id ||
                (e.course && (e.course.id === course.id || e.course.slug === course.slug)),
            );
            if (match) {
              found = true;
              prog = match.status === 'COMPLETED' ? 100 : (match.progressPct ?? 25);
            }
          }
          if (!found && me?.enrollments && Array.isArray(me.enrollments)) {
            const match = me.enrollments.find(
              (e: any) => e.courseId === course.id || e.course?.slug === course.slug,
            );
            if (match) {
              found = true;
              prog = match.progressPct ?? 25;
            }
          }
          setIsEnrolled(found);
          setUserProgressPct(prog);
        }
      } catch {
        // ignore
      }
    }
    checkEnrollment();
    return () => {
      isMounted = false;
    };
  }, [course.id, course.slug, isStudent]);

  // Module Handlers
  const handleOpenAddModule = () => {
    setModuleToEdit(null);
    setIsAddModuleOpen(true);
  };

  const handleOpenEditModule = (mod: any, index: number) => {
    setModuleToEdit({
      id: mod.id,
      title: mod.title,
      description: mod.description || '',
      index,
    });
    setIsAddModuleOpen(true);
  };

  const handleSaveModule = async (data: { title: string; description: string }) => {
    try {
      if (moduleToEdit?.id) {
        await apiService.updateCourseModule(moduleToEdit.id, data);
        toast.success(`Module "${data.title}" updated successfully!`, 'Module Updated');
      } else {
        await apiService.createCourseModule(liveCourse.id || course.id, {
          title: data.title,
          description: data.description,
          order: liveCourse.modules?.length || 0,
        });
        toast.success(`Module "${data.title}" added to curriculum!`, 'Module Created');
      }
      await refreshLiveCourse();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save module.', 'Module Save Failed');
      throw err;
    }
  };

  const handleDeleteModule = async (moduleIndex: number, moduleId?: string) => {
    if (!window.confirm('Are you sure you want to delete this module and all its submodules?')) return;
    try {
      if (moduleId && !moduleId.startsWith('mod-') && !moduleId.startsWith('highlight-')) {
        await apiService.deleteCourseModule(moduleId);
      }
      setLiveCourse((prev) => {
        const nextModules = [...(prev.modules || [])];
        if (nextModules.length > moduleIndex) {
          nextModules.splice(moduleIndex, 1);
        }
        return {
          ...prev,
          modules: nextModules,
          modulesCount: nextModules.length,
          lessonsCount: nextModules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0),
        };
      });
      toast.success('Curriculum module deleted.', 'Module Deleted');
      await refreshLiveCourse();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete module.', 'Delete Failed');
    }
  };

  const handleReorderModule = async (moduleIndex: number, direction: 'up' | 'down') => {
    const currentMods = [...(liveCourse.modules || [])];
    const targetIndex = direction === 'up' ? moduleIndex - 1 : moduleIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentMods.length) return;

    const [moved] = currentMods.splice(moduleIndex, 1);
    currentMods.splice(targetIndex, 0, moved);

    setLiveCourse((prev) => ({
      ...prev,
      modules: currentMods,
    }));

    try {
      const payload = currentMods
        .filter((m) => m.id && !m.id.startsWith('highlight-'))
        .map((m, idx) => ({ id: m.id, order: idx }));
      if (payload.length > 0) {
        await apiService.reorderCourseModules(liveCourse.id || course.id, payload);
      }
    } catch (err) {
      console.warn('Module reorder sync note:', err);
    }
  };

  // Submodule / Lesson Handlers
  const handleOpenAddLesson = (mod: any, moduleIndex: number) => {
    setTargetModuleForLesson({
      id: mod.id,
      index: moduleIndex,
      title: mod.title,
    });
    setLessonToEdit(null);
    setIsAddLessonOpen(true);
  };

  const handleOpenEditLesson = (lessonItem: any, moduleIndex: number, lessonIndex: number, moduleTitle: string) => {
    setTargetModuleForLesson({
      id: lessonItem.moduleId || liveCourse.modules?.[moduleIndex]?.id,
      index: moduleIndex,
      title: moduleTitle,
    });
    setLessonToEdit({
      id: lessonItem.id,
      moduleIndex,
      lessonIndex,
      data: lessonItem,
    });
    setIsAddLessonOpen(true);
  };

  const handleSaveLesson = async (payload: LessonAuthoringPayload) => {
    try {
      if (lessonToEdit?.id && !lessonToEdit.id.startsWith('local-')) {
        await apiService.updateCourseLesson(lessonToEdit.id, payload);
        toast.success(`Submodule "${payload.title}" updated!`, 'Submodule Saved');
      } else {
        const moduleId = targetModuleForLesson?.id || liveCourse.modules?.[targetModuleForLesson?.index ?? 0]?.id;
        if (!moduleId || moduleId.startsWith('highlight-')) {
          // If the parent module is not yet persisted to backend, inform user
          toast.error('Please create/save the parent module on the server first before adding lessons.', 'Action Required');
          return;
        }
        await apiService.createCourseLesson(moduleId, {
          ...payload,
          order: liveCourse.modules?.[targetModuleForLesson?.index ?? 0]?.lessons?.length || 0,
        });
        toast.success(`Submodule "${payload.title}" added to curriculum!`, 'Submodule Created');
      }
      await refreshLiveCourse();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save submodule.', 'Save Failed');
      throw err;
    }
  };

  const handleDeleteLesson = async (moduleIndex: number, lessonIndex: number, lessonId?: string) => {
    if (!window.confirm('Are you sure you want to delete this submodule?')) return;
    try {
      if (lessonId && !lessonId.startsWith('local-')) {
        await apiService.deleteCourseLesson(lessonId);
      }
      setLiveCourse((prev) => {
        const nextModules = [...(prev.modules || [])];
        if (nextModules[moduleIndex]) {
          const nextLessons = [...(nextModules[moduleIndex].lessons || [])];
          nextLessons.splice(lessonIndex, 1);
          nextModules[moduleIndex] = {
            ...nextModules[moduleIndex],
            lessons: nextLessons,
          };
        }
        return {
          ...prev,
          modules: nextModules,
          lessonsCount: nextModules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0),
        };
      });
      toast.success('Submodule deleted.', 'Submodule Removed');
      await refreshLiveCourse();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete submodule.', 'Delete Failed');
    }
  };

  const handleReorderLesson = async (moduleIndex: number, lessonIndex: number, direction: 'up' | 'down') => {
    const currentMods = [...(liveCourse.modules || [])];
    const targetModule = currentMods[moduleIndex];
    if (!targetModule || !targetModule.lessons) return;

    const currentLessons = [...targetModule.lessons];
    const targetIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentLessons.length) return;

    const [moved] = currentLessons.splice(lessonIndex, 1);
    currentLessons.splice(targetIndex, 0, moved);

    currentMods[moduleIndex] = {
      ...targetModule,
      lessons: currentLessons,
    };

    setLiveCourse((prev) => ({
      ...prev,
      modules: currentMods,
    }));

    try {
      if (targetModule.id && !targetModule.id.startsWith('highlight-')) {
        const payload = currentLessons
          .filter((l: any) => l.id && !String(l.id).startsWith('local-'))
          .map((l: any, idx: number) => ({ id: l.id, order: idx }));
        if (payload.length > 0) {
          await apiService.reorderCourseLessons(targetModule.id, payload);
        }
      }
    } catch (err) {
      console.warn('Lesson reorder sync note:', err);
    }
  };

  const handleEnrollOrStart = async (lessonKey?: string) => {
    const targetUrl = lessonKey
      ? `/courses/${liveCourse.slug || liveCourse.id}?lesson=${encodeURIComponent(lessonKey)}`
      : `/courses/${liveCourse.slug || liveCourse.id}?mode=workspace`;

    if (!isStudent || isEnrolled) {
      router.push(targetUrl);
      return;
    }

    setIsEnrolling(true);
    try {
      await apiService.enrollInCourse(liveCourse.id || course.id);
      setIsEnrolled(true);
      toast.success(`Successfully enrolled in ${liveCourse.title}!`, 'Enrolled');
      router.push(targetUrl);
    } catch (err: any) {
      const isAlreadyEnrolled =
        err?.response?.status === 409 ||
        err?.status === 409 ||
        err?.response?.data?.message?.toLowerCase()?.includes('already enrolled') ||
        err?.message?.toLowerCase()?.includes('already enrolled');

      if (isAlreadyEnrolled) {
        setIsEnrolled(true);
        router.push(targetUrl);
      } else {
        const errorMsg =
          err?.response?.data?.message || err?.message || 'Failed to enroll in course.';
        toast.error(errorMsg, 'Enrollment Failed');
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  // Computed live curriculum modules (empty array if 0 modules)
  const displayModules = useMemo(() => {
    if (Array.isArray(liveCourse.modules) && liveCourse.modules.length > 0) {
      return liveCourse.modules;
    }
    return [];
  }, [liveCourse.modules]);

  // Flat map of module topic items for sequential gating & completion stats
  const moduleTopicMap = useMemo(() => {
    const map: Record<number, TopicItem[]> = {};
    displayModules.forEach((_, idx) => {
      map[idx] = getModuleTopicItems(liveCourse, idx);
    });
    return map;
  }, [displayModules, liveCourse]);

  const allSubmoduleItems = useMemo(() => {
    return displayModules.flatMap((_, idx) => moduleTopicMap[idx] || []);
  }, [displayModules, moduleTopicMap]);

  const completedCount = useMemo(() => {
    return allSubmoduleItems.filter((item) => item.isCompleted).length;
  }, [allSubmoduleItems]);

  const courseCompletionPct = useMemo(() => {
    if (allSubmoduleItems.length === 0) return 0;
    return Math.round((completedCount / allSubmoduleItems.length) * 100);
  }, [allSubmoduleItems.length, completedCount]);

  // Sequential module locking: Module 0 is unlocked. Module i (i > 0) is unlocked if all submodules in Module i - 1 are completed.
  const isModuleUnlocked = (mIdx: number): boolean => {
    if (!isStudent && isStudioMode) return true;
    if (mIdx === 0) return true;
    for (let prev = 0; prev < mIdx; prev++) {
      const prevTopics = moduleTopicMap[prev] || [];
      if (prevTopics.length === 0) continue;
      const allDone = prevTopics.every((t) => t.isCompleted);
      if (!allDone) return false;
    }
    return true;
  };

  // Sequential submodule locking: If parent module is locked, submodule is locked.
  // Within parent module: submodule 0 is unlocked. Submodule sIdx (sIdx > 0) is unlocked if submodule sIdx - 1 is completed.
  const isSubmoduleUnlocked = (mIdx: number, sIdx: number): boolean => {
    if (!isStudent && isStudioMode) return true;
    if (!isModuleUnlocked(mIdx)) return false;
    if (sIdx === 0) return true;
    const currentTopics = moduleTopicMap[mIdx] || [];
    const prevSub = currentTopics[sIdx - 1];
    return Boolean(prevSub?.isCompleted);
  };

  // Module Accordion Collapse/Expand State
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (Array.isArray(liveCourse.modules)) {
      setExpandedModules((prev) => {
        const nextState: Record<number, boolean> = {};
        liveCourse.modules!.forEach((_, idx) => {
          nextState[idx] = prev[idx] !== undefined ? prev[idx] : idx === 0;
        });
        return nextState;
      });
    }
  }, [liveCourse.modules]);

  const toggleModule = (idx: number) => {
    setExpandedModules((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const allExpanded = useMemo(() => {
    if (!displayModules || displayModules.length === 0) return false;
    return displayModules.every((_, idx) => !!expandedModules[idx]);
  }, [displayModules, expandedModules]);

  const toggleAllModules = () => {
    const nextVal = !allExpanded;
    const nextState: Record<number, boolean> = {};
    (displayModules || []).forEach((_, idx) => {
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
        completedLessons: Math.round((liveCourse.lessonsCount || 0) * 0.94),
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
        completedLessons: liveCourse.lessonsCount || 0,
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
        completedLessons: Math.round((liveCourse.lessonsCount || 0) * 0.82),
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
        completedLessons: Math.round((liveCourse.lessonsCount || 0) * 0.65),
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
        completedLessons: Math.round((liveCourse.lessonsCount || 0) * 0.45),
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
        completedLessons: Math.round((liveCourse.lessonsCount || 0) * 0.2),
        quizScorePct: 75,
        lastActive: '1 week ago',
        status: 'Inactive',
      },
    ],
    [liveCourse]
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

  const filteredStudents = useMemo(() => {
    return liveRoster;
  }, [liveRoster]);

  const filteredLabs = courseAssignments.filter(
    (l) =>
      l.title.toLowerCase().includes(labSearch.toLowerCase()) ||
      l.module.toLowerCase().includes(labSearch.toLowerCase())
  );

  const getModuleProblemsCount = (mod: any, idx: number, topics: TopicItem[]) => {
    let count = 0;
    if (topics && topics.length > 0) {
      for (const t of topics) {
        if (Array.isArray(t.problems) && t.problems.length > 0) {
          count += t.problems.length;
        } else if (t.codingProblem || t.type === 'lab') {
          count += 1;
        }
      }
    } else if (Array.isArray(mod?.lessons) && mod.lessons.length > 0) {
      for (const l of mod.lessons) {
        if (Array.isArray(l.problems) && l.problems.length > 0) {
          count += l.problems.length;
        } else if (l.codingProblem || l.type === 'lab') {
          count += 1;
        }
      }
    }
    return count;
  };

  const totalProblemsCount = useMemo(() => {
    if (!displayModules || displayModules.length === 0) return 0;
    return displayModules.reduce((total, mod, idx) => {
      const topics = getModuleTopicItems(liveCourse, idx);
      return total + getModuleProblemsCount(mod, idx, topics);
    }, 0);
  }, [displayModules, liveCourse]);

  const learningItems = useMemo(() => {
    if (Array.isArray(liveCourse.learningOutcomes) && liveCourse.learningOutcomes.length > 0) {
      return liveCourse.learningOutcomes;
    }
    if (Array.isArray(liveCourse.learningItems) && liveCourse.learningItems.length > 0) {
      return liveCourse.learningItems;
    }
    if (liveCourse.whatYouWillLearn && liveCourse.whatYouWillLearn.length > 0) {
      return liveCourse.whatYouWillLearn.map((item: any) => typeof item === 'string' ? item : item.title || item.description);
    }
    const cat = liveCourse.category as CourseCategory;
    if (cat && DEFAULT_LEARNING_OUTCOMES[cat]) {
      return DEFAULT_LEARNING_OUTCOMES[cat];
    }
    return [
      `Learn ${liveCourse.category || liveCourse.title} Syntax & Core Fundamentals`,
      'Problem Solving with Algorithmic Patterns',
      'Practice Conditionals, Loops & Recursion',
      '500 to 1350 Difficulty Rating Coding Labs',
      'Object-Oriented Programming (OOP) & Modularity',
      'Automated Sandbox Runner with Instant Verdicts',
    ];
  }, [liveCourse]);

  const innerContent = (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3.5 }}>
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
            {liveCourse.title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {(!isStudent || isStudioMode) && (
            <Button
              variant="outlined"
              onClick={() => setIsEditCourseModalOpen(true)}
              startIcon={<EditRoundedIcon sx={{ fontSize: 17 }} />}
              sx={{
                bgcolor: '#FFFFFF',
                color: '#2563EB',
                borderColor: '#BFDBFE',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.84rem',
                px: 2,
                py: 0.7,
                '&:hover': { bgcolor: '#EFF6FF', borderColor: '#93C5FD' },
              }}
            >
              Edit Course Details
            </Button>
          )}

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
            disabled={isEnrolling}
            onClick={() => handleEnrollOrStart('0-0')}
            startIcon={
              isEnrolling ? (
                <CircularProgress size={16} sx={{ color: '#FFFFFF' }} />
              ) : (
                <PlayArrowRoundedIcon sx={{ fontSize: 19 }} />
              )
            }
            sx={{
              background: isEnrolled
                ? 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)'
                : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              px: 2.5,
              py: 0.7,
              boxShadow: isEnrolled
                ? '0 4px 14px rgba(22, 163, 74, 0.25)'
                : '0 4px 14px rgba(37, 99, 235, 0.25)',
              '&:hover': {
                background: isEnrolled
                  ? 'linear-gradient(135deg, #15803D 0%, #166534 100%)'
                  : 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
                boxShadow: isEnrolled
                  ? '0 6px 20px rgba(22, 163, 74, 0.35)'
                  : '0 6px 20px rgba(37, 99, 235, 0.35)',
              },
            }}
          >
            {isEnrolling
              ? 'Enrolling...'
              : isEnrolled
                ? 'Open Live Workspace'
                : 'Enroll & Start Learning'}
          </Button>
        </Box>
      </Box>

      {/* 1. Ultra-Luxury Deep Sapphire Hero Banner with Interactive Elastic Warp Grid */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          bgcolor: '#07152E',
          backgroundImage: `
            radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 0% 100%, rgba(99, 102, 241, 0.25) 0%, transparent 50%),
            linear-gradient(135deg, #071329 0%, #0C234F 60%, #153272 100%)
          `,
          p: { xs: 2.5, sm: 3, md: 3.5 },
          boxShadow: '0 12px 36px rgba(11, 34, 74, 0.16)',
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', lg: 'center' },
          gap: 3,
        }}
      >
        {/* Interactive Gravitational Warp Grid Canvas */}
        <InteractiveWarpGrid
          gridSize={36}
          warpRadius={200}
          warpStrength={50}
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
        <Box sx={{ position: 'relative', zIndex: 1, flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          {/* Live Accreditation Tag */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <VerifiedRoundedIcon sx={{ fontSize: 16, color: '#10B981' }} />
            <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.01em' }}>
              Standardized Academic Accreditation
            </Typography>
          </Box>

          {/* Title & Edit Action */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.15rem' },
                letterSpacing: '-0.025em',
                color: '#FFFFFF',
                lineHeight: 1.2,
              }}
            >
              {liveCourse.title}
            </Typography>
            {(!isStudent || isStudioMode) && (
              <Tooltip title="Edit Course Details (Title, Code, Cover Image, Description, Tags)">
                <IconButton
                  size="small"
                  onClick={() => setIsEditCourseModalOpen(true)}
                  sx={{
                    color: '#FFFFFF',
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(8px)',
                    p: 0.75,
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' },
                  }}
                >
                  <EditRoundedIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Description */}
          <Typography
            sx={{
              color: '#CBD5E1',
              fontSize: { xs: '0.88rem', md: '0.94rem' },
              lineHeight: 1.55,
              maxWidth: 680,
              fontWeight: 450,
            }}
          >
            {liveCourse.description}
          </Typography>

          {/* Badges Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.25, pt: 0.25 }}>
            {/* Certificate Pill */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.4,
                py: 0.5,
                borderRadius: '9999px',
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#FFFFFF',
              }}
            >
              <WorkspacePremiumRoundedIcon sx={{ fontSize: 16, color: '#FCD34D' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
                Verified Certificate Included
              </Typography>
            </Box>

            {/* Star Rating Badge */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.6,
                px: 1.3,
                py: 0.5,
                borderRadius: '9999px',
                bgcolor: '#F59E0B',
                color: '#0F172A',
                fontWeight: 800,
              }}
            >
              <StarRoundedIcon sx={{ fontSize: 16, color: '#0F172A' }} />
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 800 }}>
                4.9
              </Typography>
              <Typography sx={{ fontSize: '0.74rem', color: '#1E293B', fontWeight: 700 }}>
                (188.2k)
              </Typography>
            </Box>

            {/* Sandbox Tag */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.6,
                px: 1.3,
                py: 0.5,
                borderRadius: '9999px',
                bgcolor: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#A7F3D0',
              }}
            >
              <BoltRoundedIcon sx={{ fontSize: 15, color: '#34D399' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
                Instant GCC/CPython
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Hero Right: Compact Course Snapshot Card (without cover image) */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            width: { xs: '100%', sm: 310, lg: 330 },
            flexShrink: 0,
            borderRadius: '18px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            p: { xs: 2, md: 2.25 },
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            boxShadow: '0 16px 36px -10px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.92rem', letterSpacing: '-0.01em' }}>
                Course Snapshot
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: '0.74rem', fontWeight: 500 }}>
                Self-paced developer curriculum
              </Typography>
            </Box>
            <Chip
              label={liveCourse.level || 'Intermediate'}
              size="small"
              sx={{
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                border: '1px solid #DBEAFE',
                fontWeight: 750,
                fontSize: '0.7rem',
                height: 22,
              }}
            />
          </Box>

          {/* Compact Key Specs List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.85 }}>
            {/* Modules Spec */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 0.85, px: 1.25, borderRadius: '10px', bgcolor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 26, height: 26, borderRadius: '7px', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <LayersRoundedIcon sx={{ fontSize: 16 }} />
                </Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 650, color: '#1E293B' }}>
                  Curriculum Units
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A' }}>
                {liveCourse.modulesCount ?? liveCourse.modules?.length ?? 0} Modules
              </Typography>
            </Box>

            {/* Duration Spec */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 0.85, px: 1.25, borderRadius: '10px', bgcolor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 26, height: 26, borderRadius: '7px', bgcolor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
                  <AccessTimeRoundedIcon sx={{ fontSize: 16 }} />
                </Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 650, color: '#1E293B' }}>
                  Learning Content
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A' }}>
                {liveCourse.durationHours} Hours
              </Typography>
            </Box>

            {/* Problems Spec */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 0.85, px: 1.25, borderRadius: '10px', bgcolor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 26, height: 26, borderRadius: '7px', bgcolor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                  <TerminalRoundedIcon sx={{ fontSize: 16 }} />
                </Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 650, color: '#1E293B' }}>
                  Coding Labs & Tests
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A' }}>
                {totalProblemsCount} Labs
              </Typography>
            </Box>
          </Box>

          {/* Progress Bar & Primary Action */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 0.25 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>
                Mastery Progress
              </Typography>
              <Typography sx={{ fontSize: '0.74rem', color: isEnrolled ? '#16A34A' : '#2563EB', fontWeight: 750 }}>
                {isEnrolled
                  ? `${Math.round((userProgressPct / 100) * totalProblemsCount)} of ${totalProblemsCount} solved (${userProgressPct}%)`
                  : `0 of ${totalProblemsCount} solved (0%)`}
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={userProgressPct}
              sx={{
                height: 6,
                borderRadius: '9999px',
                bgcolor: '#F1F5F9',
                '& .MuiLinearProgress-bar': {
                  background: isEnrolled
                    ? 'linear-gradient(90deg, #16A34A 0%, #34D399 100%)'
                    : 'linear-gradient(90deg, #2563EB 0%, #38BDF8 100%)',
                  borderRadius: '9999px',
                },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              disabled={isEnrolling}
              onClick={() => handleEnrollOrStart()}
              startIcon={
                isEnrolling ? (
                  <CircularProgress size={16} sx={{ color: '#FFFFFF' }} />
                ) : isEnrolled ? (
                  <PlayArrowRoundedIcon sx={{ fontSize: 18 }} />
                ) : (
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />
                )
              }
              sx={{
                mt: 0.25,
                background: isEnrolled
                  ? 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)'
                  : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.84rem',
                textTransform: 'none',
                borderRadius: '12px',
                py: 0.9,
                boxShadow: isEnrolled
                  ? '0 4px 12px rgba(22, 163, 74, 0.25)'
                  : '0 4px 12px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: isEnrolled
                    ? 'linear-gradient(135deg, #15803D 0%, #166534 100%)'
                    : 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
                  boxShadow: isEnrolled
                    ? '0 6px 16px rgba(22, 163, 74, 0.35)'
                    : '0 6px 16px rgba(37, 99, 235, 0.35)',
                },
              }}
            >
              {isEnrolling
                ? 'Enrolling...'
                : isEnrolled
                  ? 'Continue Learning'
                  : 'Enroll in Course (Free)'}
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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.25, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LightbulbRoundedIcon sx={{ color: '#2563EB', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.08rem' }}>
                      What you'll learn
                    </Typography>
                  </Box>
                  {(!isStudent || isStudioMode) && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleOpenEditOutcomes}
                      startIcon={<EditRoundedIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        borderRadius: '10px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        color: '#2563EB',
                        borderColor: '#BFDBFE',
                        bgcolor: '#EFF6FF',
                        py: 0.5,
                        px: 1.75,
                        '&:hover': {
                          bgcolor: '#DBEAFE',
                          borderColor: '#93C5FD',
                        },
                      }}
                    >
                      Edit Learning Points
                    </Button>
                  )}
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                    rowGap: 1.75,
                    columnGap: 3,
                  }}
                >
                  {learningItems.map((item: string, idx: number) => (
                    <Box key={`learning-item-${idx}-${item.slice(0, 15)}`} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CheckRoundedIcon sx={{ color: '#2563EB', fontSize: 20, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
                        {item}
                      </Typography>
                    </Box>
                  ))}
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
                            label={liveCourse.modulesCount ?? liveCourse.modules?.length ?? 0}
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
                    {/* Curriculum Header & Superadmin Studio Switcher */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
                            Curriculum Units Breakdown
                          </Typography>
                          {!isStudent && (
                            <Chip
                              label={isStudioMode ? 'STUDIO AUTHORING MODE' : 'STUDENT PREVIEW'}
                              size="small"
                              sx={{
                                height: 22,
                                fontWeight: 800,
                                fontSize: '0.68rem',
                                bgcolor: isStudioMode ? '#EFF6FF' : '#F1F5F9',
                                color: isStudioMode ? '#2563EB' : '#64748B',
                                border: isStudioMode ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                              }}
                            />
                          )}
                        </Box>
                        <Typography sx={{ color: '#64748B', fontSize: '0.84rem' }}>
                          Step-by-step modular lessons with interactive theory notes, single MCQs, multi MSQs, and sandbox coding challenges.
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        {/* Superadmin Mode Switcher */}
                        {!isStudent && (
                          <Button
                            variant="outlined"
                            onClick={() => setIsStudioMode(!isStudioMode)}
                            startIcon={isStudioMode ? <VisibilityRoundedIcon sx={{ fontSize: 17 }} /> : <TuneRoundedIcon sx={{ fontSize: 17 }} />}
                            sx={{
                              borderRadius: '9999px',
                              borderColor: isStudioMode ? '#BFDBFE' : '#E2E8F0',
                              color: isStudioMode ? '#2563EB' : '#475569',
                              bgcolor: isStudioMode ? '#EFF6FF' : '#FFFFFF',
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              px: 2,
                              py: 0.65,
                              '&:hover': {
                                bgcolor: isStudioMode ? '#DBEAFE' : '#F8FAFC',
                                borderColor: isStudioMode ? '#93C5FD' : '#CBD5E1',
                              },
                            }}
                          >
                            {isStudioMode ? 'Switch to Student View' : 'Open Curriculum Studio'}
                          </Button>
                        )}

                        {/* Publish / Unpublish Toggle in Studio Mode */}
                        {!isStudent && isStudioMode && (
                          <Button
                            variant="outlined"
                            onClick={handleTogglePublish}
                            disabled={isTogglingPublish}
                            startIcon={
                              isTogglingPublish ? (
                                <CircularProgress size={14} />
                              ) : (
                                <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />
                              )
                            }
                            sx={{
                              borderRadius: '9999px',
                              borderColor: (liveCourse.status === 'Published' || (liveCourse.status as string) === 'PUBLISHED') ? '#CBD5E1' : '#86EFAC',
                              color: (liveCourse.status === 'Published' || (liveCourse.status as string) === 'PUBLISHED') ? '#475569' : '#16A34A',
                              bgcolor: (liveCourse.status === 'Published' || (liveCourse.status as string) === 'PUBLISHED') ? '#FFFFFF' : '#F0FDF4',
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              px: 2,
                              py: 0.65,
                              '&:hover': {
                                bgcolor: (liveCourse.status === 'Published' || (liveCourse.status as string) === 'PUBLISHED') ? '#F1F5F9' : '#DCFCE7',
                              },
                            }}
                          >
                            {isTogglingPublish
                              ? 'Updating...'
                              : (liveCourse.status === 'Published' || (liveCourse.status as string) === 'PUBLISHED')
                                ? 'Unpublish to Draft'
                                : 'Publish Course'}
                          </Button>
                        )}

                        {/* Add Module Button in Studio Mode */}
                        {!isStudent && isStudioMode && (
                          <Button
                            variant="contained"
                            onClick={handleOpenAddModule}
                            startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                            sx={{
                              borderRadius: '9999px',
                              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                              color: '#FFFFFF',
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.84rem',
                              px: 2.4,
                              py: 0.65,
                              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
                                boxShadow: '0 6px 18px rgba(37, 99, 235, 0.35)',
                              },
                            }}
                          >
                            Add Unit Module
                          </Button>
                        )}

                        {/* Bulk Import Button in Studio Mode */}
                        {!isStudent && isStudioMode && (
                          <Button
                            variant="outlined"
                            onClick={() => setIsBulkImportOpen(true)}
                            startIcon={<CloudUploadRoundedIcon sx={{ fontSize: 18 }} />}
                            sx={{
                              borderRadius: '9999px',
                              borderColor: '#BFDBFE',
                              color: '#2563EB',
                              bgcolor: '#EFF6FF',
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.84rem',
                              px: 2.2,
                              py: 0.65,
                              '&:hover': {
                                bgcolor: '#DBEAFE',
                                borderColor: '#93C5FD',
                              },
                            }}
                          >
                            Bulk Import
                          </Button>
                        )}

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
                      </Box>
                    </Box>

                    {/* Course Completion Progress Summary Card */}
                    {allSubmoduleItems.length > 0 && (
                      <Card
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: '16px',
                          bgcolor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1.5,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                              sx={{
                                width: 38,
                                height: 38,
                                borderRadius: '10px',
                                bgcolor: courseCompletionPct === 100 ? '#ECFDF5' : '#EFF6FF',
                                color: courseCompletionPct === 100 ? '#10B981' : '#2563EB',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `1px solid ${courseCompletionPct === 100 ? '#A7F3D0' : '#BFDBFE'}`,
                              }}
                            >
                              {courseCompletionPct === 100 ? (
                                <EmojiEventsRoundedIcon sx={{ fontSize: 20 }} />
                              ) : (
                                <BoltRoundedIcon sx={{ fontSize: 20 }} />
                              )}
                            </Box>
                            <Box>
                              <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.96rem' }}>
                                Course Completion Progress: {courseCompletionPct}%
                              </Typography>
                              <Typography sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
                                {completedCount} of {allSubmoduleItems.length} submodules completed • Sequential Gated Progression
                              </Typography>
                            </Box>
                          </Box>

                          <Chip
                            label={courseCompletionPct === 100 ? 'Course Completed 🎉' : `${allSubmoduleItems.length - completedCount} Submodules Remaining`}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              bgcolor: courseCompletionPct === 100 ? '#ECFDF5' : '#EFF6FF',
                              color: courseCompletionPct === 100 ? '#059669' : '#2563EB',
                              border: `1px solid ${courseCompletionPct === 100 ? '#A7F3D0' : '#BFDBFE'}`,
                            }}
                          />
                        </Box>

                        {/* Linear Progress Track */}
                        <Box sx={{ width: '100%', bgcolor: '#E2E8F0', borderRadius: '9999px', height: 8, overflow: 'hidden' }}>
                          <Box
                            sx={{
                              width: `${courseCompletionPct}%`,
                              height: '100%',
                              borderRadius: '9999px',
                              bgcolor: courseCompletionPct === 100 ? '#10B981' : '#2563EB',
                              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                          />
                        </Box>
                      </Card>
                    )}

                    {/* Modular Units Stream */}
                    {displayModules.length === 0 ? (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          py: 7,
                          px: 3,
                          bgcolor: '#F8FAFC',
                          borderRadius: '20px',
                          border: '1.5px dashed #CBD5E1',
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '16px',
                            bgcolor: '#EFF6FF',
                            color: '#2563EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #BFDBFE',
                          }}
                        >
                          <LayersRoundedIcon sx={{ fontSize: 28 }} />
                        </Box>
                        <Box sx={{ maxWidth: 460 }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem', mb: 0.5 }}>
                            No Curriculum Modules Added Yet
                          </Typography>
                          <Typography sx={{ color: '#64748B', fontSize: '0.86rem', lineHeight: 1.6 }}>
                            This course currently has 0 modules. Use the Curriculum Studio to add your first unit chapter, notes, quizzes, or coding challenges.
                          </Typography>
                        </Box>
                        {!isStudent && (
                          <Button
                            variant="contained"
                            onClick={handleOpenAddModule}
                            startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                            sx={{
                              borderRadius: '9999px',
                              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                              color: '#FFFFFF',
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.86rem',
                              px: 3,
                              py: 0.8,
                              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
                                boxShadow: '0 6px 18px rgba(37, 99, 235, 0.35)',
                              },
                            }}
                          >
                            Create First Module
                          </Button>
                        )}
                      </Box>
                    ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      {displayModules.map((modItem: any, idx: number) => {
                        const topicItems = moduleTopicMap[idx] || getModuleTopicItems(liveCourse, idx);
                        const modTitle = modItem.title || `Module ${idx + 1}`;
                        const modLessonCount = Array.isArray(modItem.lessons)
                          ? modItem.lessons.length
                          : typeof modItem.lessons === 'number'
                          ? modItem.lessons
                          : topicItems.length;
                        const problemsCount = getModuleProblemsCount(modItem, idx, topicItems);
                        const isExpanded = !!expandedModules[idx];
                        const firstLessonKey = topicItems[0]?.id || `${idx}-0`;
                        const totalUnits = ((liveCourse.modules && liveCourse.modules.length > 0) ? liveCourse.modules.length : (liveCourse.moduleHighlights?.length || 0));
                        const isLast = idx === totalUnits - 1;
                        const modUnlocked = isModuleUnlocked(idx);
                        const modCompleted = topicItems.length > 0 && topicItems.every((t) => t.isCompleted);

                        return (
                          <Box
                            key={modItem.id || idx}
                            sx={{
                              borderBottom: isLast ? 'none' : '1px solid #E2E8F0',
                              transition: 'all 0.2s ease',
                              py: { xs: 1.5, md: 2 },
                              opacity: modUnlocked ? 1 : 0.72,
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
                                    bgcolor: modCompleted
                                      ? '#ECFDF5'
                                      : !modUnlocked
                                      ? '#F1F5F9'
                                      : isExpanded
                                      ? '#2563EB'
                                      : '#EFF6FF',
                                    border: modCompleted
                                      ? '1px solid #A7F3D0'
                                      : !modUnlocked
                                      ? '1px solid #E2E8F0'
                                      : isExpanded
                                      ? '1px solid #2563EB'
                                      : '1px solid #BFDBFE',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 900,
                                    fontSize: '1.05rem',
                                    color: modCompleted
                                      ? '#059669'
                                      : !modUnlocked
                                      ? '#94A3B8'
                                      : isExpanded
                                      ? '#FFFFFF'
                                      : '#2563EB',
                                    flexShrink: 0,
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  {modCompleted ? (
                                    <CheckRoundedIcon sx={{ fontSize: 22 }} />
                                  ) : !modUnlocked ? (
                                    <LockRoundedIcon sx={{ fontSize: 18 }} />
                                  ) : (
                                    `0${idx + 1}`
                                  )}
                                </Box>

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography
                                      sx={{
                                        fontWeight: 800,
                                        fontSize: { xs: '1.05rem', md: '1.18rem' },
                                        color: modUnlocked ? '#0F172A' : '#64748B',
                                        letterSpacing: '-0.01em',
                                      }}
                                    >
                                      {modTitle}
                                    </Typography>
                                    {!modUnlocked && (
                                      <Chip
                                        icon={<LockRoundedIcon sx={{ fontSize: '13px !important', color: 'inherit !important' }} />}
                                        label="Locked Unit"
                                        size="small"
                                        sx={{
                                          height: 20,
                                          fontSize: '0.68rem',
                                          fontWeight: 800,
                                          bgcolor: '#F1F5F9',
                                          color: '#64748B',
                                          border: '1px solid #E2E8F0',
                                        }}
                                      />
                                    )}
                                    {modCompleted && (
                                      <Chip
                                        icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important', color: 'inherit !important' }} />}
                                        label="Unit Completed"
                                        size="small"
                                        sx={{
                                          height: 20,
                                          fontSize: '0.68rem',
                                          fontWeight: 800,
                                          bgcolor: '#ECFDF5',
                                          color: '#059669',
                                          border: '1px solid #A7F3D0',
                                        }}
                                      />
                                    )}
                                  </Box>
                                  <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.84rem', mt: 0.35 }}>
                                    Interactive Unit • {modLessonCount} Lessons • {problemsCount} Practice Problems
                                  </Typography>
                                </Box>
                              </Box>

                              {/* Module Actions */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                                {/* Authoring Mode Module Actions */}
                                {!isStudent && isStudioMode && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenAddLesson(modItem, idx);
                                      }}
                                      startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                                      sx={{
                                        borderRadius: '8px',
                                        fontSize: '0.78rem',
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        color: '#2563EB',
                                        borderColor: '#BFDBFE',
                                        bgcolor: '#EFF6FF',
                                        px: 1.5,
                                        py: 0.4,
                                        '&:hover': { bgcolor: '#DBEAFE', borderColor: '#93C5FD' },
                                      }}
                                    >
                                      Add Submodule
                                    </Button>

                                    <Tooltip title="Edit Module Title/Description">
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenEditModule(modItem, idx);
                                        }}
                                        sx={{ color: '#64748B', bgcolor: '#F1F5F9', '&:hover': { color: '#0F172A', bgcolor: '#E2E8F0' } }}
                                      >
                                        <EditRoundedIcon sx={{ fontSize: 16 }} />
                                      </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Move Module Up">
                                      <span>
                                        <IconButton
                                          size="small"
                                          disabled={idx === 0}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleReorderModule(idx, 'up');
                                          }}
                                          sx={{ color: '#64748B', bgcolor: '#F1F5F9', '&:hover': { color: '#0F172A', bgcolor: '#E2E8F0' } }}
                                        >
                                          <ArrowUpwardRoundedIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                      </span>
                                    </Tooltip>

                                    <Tooltip title="Move Module Down">
                                      <span>
                                        <IconButton
                                          size="small"
                                          disabled={idx === totalUnits - 1}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleReorderModule(idx, 'down');
                                          }}
                                          sx={{ color: '#64748B', bgcolor: '#F1F5F9', '&:hover': { color: '#0F172A', bgcolor: '#E2E8F0' } }}
                                        >
                                          <ArrowDownwardRoundedIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                      </span>
                                    </Tooltip>

                                    <Tooltip title="Delete Module">
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteModule(idx, modItem.id);
                                        }}
                                        sx={{ color: '#94A3B8', bgcolor: '#F1F5F9', '&:hover': { color: '#EF4444', bgcolor: '#FEE2E2' } }}
                                      >
                                        <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                )}

                                <Tooltip title={modUnlocked ? 'Start Module' : 'Complete previous units to unlock this module'}>
                                  <span>
                                    <Button
                                      variant="contained"
                                      disabled={isEnrolling || !modUnlocked}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (!modUnlocked) {
                                          toast.warning('Please complete all previous modules before starting this unit.', 'Module Locked');
                                          return;
                                        }
                                        handleEnrollOrStart(firstLessonKey);
                                      }}
                                      startIcon={modUnlocked ? <PlayArrowRoundedIcon sx={{ fontSize: 18 }} /> : <LockRoundedIcon sx={{ fontSize: 16 }} />}
                                      sx={{
                                        borderRadius: '9999px',
                                        bgcolor: modUnlocked ? '#2563EB' : '#F1F5F9',
                                        color: modUnlocked ? '#FFFFFF' : '#94A3B8',
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        fontSize: '0.84rem',
                                        px: 2.5,
                                        py: 0.7,
                                        boxShadow: 'none',
                                        '&:hover': {
                                          bgcolor: modUnlocked ? '#1D4ED8' : '#F1F5F9',
                                          boxShadow: modUnlocked ? '0 4px 14px rgba(37,99,235,0.25)' : 'none',
                                        },
                                        '&.Mui-disabled': {
                                          bgcolor: '#F1F5F9',
                                          color: '#94A3B8',
                                        },
                                      }}
                                    >
                                      {modUnlocked ? 'Start Module' : 'Locked'}
                                    </Button>
                                  </span>
                                </Tooltip>

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
                                  {topicItems.map((item: any, tIdx: number) => {
                                    const subKey = item.id || `${idx}-${tIdx}`;
                                    const isSubExpanded = !!expandedSubModules[subKey];
                                    const isSubLast = tIdx === topicItems.length - 1;
                                    const itemType = (item.type || 'reading').toLowerCase();
                                    const isQuiz = itemType === 'quiz';
                                    const isMSQ = item.quizMCQ?.isMSQ || (Array.isArray(item.quizMCQ?.correctIndices) && item.quizMCQ.correctIndices.length > 1);
                                    const isCode = itemType === 'code' || itemType === 'lab';
                                    const isSubUnlocked = isSubmoduleUnlocked(idx, tIdx);
                                    const hasAttempt = Boolean(item.quizAttempt || item.codeSubmission || item.userProgress?.quizAttempt);

                                    return (
                                      <Box
                                        key={subKey || tIdx}
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'stretch',
                                          gap: 2,
                                          position: 'relative',
                                          opacity: isSubUnlocked ? 1 : 0.65,
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
                                          {/* Waypoint Milestone Node: Circled tick for completed, Lock icon for locked, Normal circle for unlocked */}
                                          <Box
                                            onClick={() => {
                                              if (isSubUnlocked) toggleSubModule(subKey);
                                              else toast.warning('Complete previous submodules to unlock this lesson.', 'Lesson Locked');
                                            }}
                                            sx={{
                                              width: 18,
                                              height: 18,
                                              borderRadius: '50%',
                                              bgcolor: item.isCompleted
                                                ? '#10B981'
                                                : !isSubUnlocked
                                                ? '#F1F5F9'
                                                : isSubExpanded
                                                ? '#2563EB'
                                                : '#FFFFFF',
                                              border: item.isCompleted
                                                ? '1.5px solid #10B981'
                                                : !isSubUnlocked
                                                ? '1.5px solid #CBD5E1'
                                                : `2px solid ${isSubExpanded ? '#2563EB' : '#94A3B8'}`,
                                              color: item.isCompleted
                                                ? '#FFFFFF'
                                                : !isSubUnlocked
                                                ? '#94A3B8'
                                                : isSubExpanded
                                                ? '#FFFFFF'
                                                : '#64748B',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              boxShadow: item.isCompleted
                                                ? '0 0 0 2px #FFFFFF, 0 1px 4px rgba(16, 185, 129, 0.25)'
                                                : isSubExpanded
                                                ? '0 0 0 4px rgba(37, 99, 235, 0.18)'
                                                : '0 0 0 2px #FFFFFF',
                                              zIndex: 2,
                                              flexShrink: 0,
                                              mt: 1.6,
                                              cursor: isSubUnlocked ? 'pointer' : 'not-allowed',
                                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                              '&:hover': {
                                                borderColor: isSubUnlocked ? (item.isCompleted ? '#059669' : '#2563EB') : '#CBD5E1',
                                                transform: isSubUnlocked ? 'scale(1.15)' : 'none',
                                              },
                                            }}
                                          >
                                            {item.isCompleted ? (
                                              <CheckRoundedIcon sx={{ fontSize: 12, color: '#FFFFFF', stroke: '#FFFFFF', strokeWidth: 0.5 }} />
                                            ) : !isSubUnlocked ? (
                                              <LockRoundedIcon sx={{ fontSize: 11, color: '#94A3B8' }} />
                                            ) : null}
                                          </Box>

                                          {/* Vertical Pathway Trail Line */}
                                          {!isSubLast && (
                                            <Box
                                              sx={{
                                                flex: 1,
                                                width: 2,
                                                bgcolor: item.isCompleted ? '#86EFAC' : isSubExpanded ? '#BFDBFE' : '#E2E8F0',
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
                                            onClick={() => {
                                              if (isSubUnlocked) toggleSubModule(subKey);
                                              else toast.warning('Complete previous submodules to unlock this lesson.', 'Lesson Locked');
                                            }}
                                            sx={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'space-between',
                                              gap: 2,
                                              py: 1.4,
                                              px: 1.25,
                                              borderRadius: '8px',
                                              cursor: isSubUnlocked ? 'pointer' : 'not-allowed',
                                              bgcolor: isSubExpanded ? '#F8FAFC' : 'transparent',
                                              transition: 'background-color 0.15s ease',
                                              '&:hover': {
                                                bgcolor: isSubUnlocked ? '#F8FAFC' : 'transparent',
                                                '& .sub-title': { color: isSubUnlocked ? '#2563EB' : '#94A3B8' },
                                              },
                                            }}
                                          >
                                            {/* Submodule Type Pill & Title */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flex: 1, minWidth: 0 }}>
                                              <Chip
                                                icon={
                                                  isCode ? (
                                                    <CodeRoundedIcon sx={{ fontSize: '13px !important', color: 'inherit !important' }} />
                                                  ) : isMSQ ? (
                                                    <CheckBoxRoundedIcon sx={{ fontSize: '13px !important', color: 'inherit !important' }} />
                                                  ) : isQuiz ? (
                                                    <QuizRoundedIcon sx={{ fontSize: '13px !important', color: 'inherit !important' }} />
                                                  ) : (
                                                    <MenuBookRoundedIcon sx={{ fontSize: '13px !important', color: 'inherit !important' }} />
                                                  )
                                                }
                                                label={
                                                  isCode
                                                    ? 'Code Lab'
                                                    : isMSQ
                                                    ? 'MSQ Quiz'
                                                    : isQuiz
                                                    ? 'MCQ Quiz'
                                                    : 'Theory'
                                                }
                                                size="small"
                                                sx={{
                                                  height: 22,
                                                  fontSize: '0.72rem',
                                                  fontWeight: 700,
                                                  bgcolor: isCode
                                                    ? '#ECFDF5'
                                                    : isMSQ || isQuiz
                                                    ? '#FEF3C7'
                                                    : '#EFF6FF',
                                                  color: isCode
                                                    ? '#059669'
                                                    : isMSQ || isQuiz
                                                    ? '#B45309'
                                                    : '#2563EB',
                                                  border: '1px solid',
                                                  borderColor: isCode
                                                    ? '#A7F3D0'
                                                    : isMSQ || isQuiz
                                                    ? '#FDE68A'
                                                    : '#BFDBFE',
                                                }}
                                              />

                                              <Typography
                                                className="sub-title"
                                                sx={{
                                                  fontSize: '0.9rem',
                                                  color: !isSubUnlocked ? '#94A3B8' : isSubExpanded ? '#2563EB' : '#1E293B',
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

                                              {!isSubUnlocked && (
                                                <Tooltip title="Complete previous submodule to unlock">
                                                  <Chip
                                                    icon={<LockRoundedIcon sx={{ fontSize: '12px !important', color: 'inherit !important' }} />}
                                                    label="Locked"
                                                    size="small"
                                                    sx={{ height: 19, fontSize: '0.66rem', bgcolor: '#F1F5F9', color: '#94A3B8', fontWeight: 700 }}
                                                  />
                                                </Tooltip>
                                              )}

                                              {hasAttempt && !item.isCompleted && (
                                                <Tooltip title="Attempted by student">
                                                  <Chip
                                                    label="Attempted"
                                                    size="small"
                                                    sx={{ height: 19, fontSize: '0.66rem', bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 700, border: '1px solid #FDE68A' }}
                                                  />
                                                </Tooltip>
                                              )}

                                              {item.isCompleted && (
                                                <Tooltip title="Lesson Completed">
                                                  <Chip
                                                    icon={<CheckCircleRoundedIcon sx={{ fontSize: '12px !important', color: 'inherit !important' }} />}
                                                    label="Completed"
                                                    size="small"
                                                    sx={{ height: 19, fontSize: '0.66rem', bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700, border: '1px solid #A7F3D0' }}
                                                  />
                                                </Tooltip>
                                              )}
                                            </Box>

                                            {/* Right Meta: Duration & Authoring / Preview Actions */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexShrink: 0 }}>
                                              <Typography sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
                                                {item.duration}
                                              </Typography>

                                              {/* Studio Mode Submodule Controls */}
                                              {!isStudent && isStudioMode && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                                                  <Tooltip title="Edit Submodule Notes/Quiz/Code">
                                                    <IconButton
                                                      size="small"
                                                      onClick={() => handleOpenEditLesson(item, idx, tIdx, modTitle)}
                                                      sx={{ color: '#64748B', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}
                                                    >
                                                      <EditRoundedIcon sx={{ fontSize: 15 }} />
                                                    </IconButton>
                                                  </Tooltip>

                                                  <Tooltip title="Move Submodule Up">
                                                    <span>
                                                      <IconButton
                                                        size="small"
                                                        disabled={tIdx === 0}
                                                        onClick={() => handleReorderLesson(idx, tIdx, 'up')}
                                                        sx={{ color: '#64748B', '&:hover': { color: '#0F172A' } }}
                                                      >
                                                        <ArrowUpwardRoundedIcon sx={{ fontSize: 15 }} />
                                                      </IconButton>
                                                    </span>
                                                  </Tooltip>

                                                  <Tooltip title="Move Submodule Down">
                                                    <span>
                                                      <IconButton
                                                        size="small"
                                                        disabled={tIdx === topicItems.length - 1}
                                                        onClick={() => handleReorderLesson(idx, tIdx, 'down')}
                                                        sx={{ color: '#64748B', '&:hover': { color: '#0F172A' } }}
                                                      >
                                                        <ArrowDownwardRoundedIcon sx={{ fontSize: 15 }} />
                                                      </IconButton>
                                                    </span>
                                                  </Tooltip>

                                                  <Tooltip title="Delete Submodule">
                                                    <IconButton
                                                      size="small"
                                                      onClick={() => handleDeleteLesson(idx, tIdx, item.id)}
                                                      sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', bgcolor: '#FEE2E2' } }}
                                                    >
                                                      <DeleteOutlineRoundedIcon sx={{ fontSize: 15 }} />
                                                    </IconButton>
                                                  </Tooltip>
                                                </Box>
                                              )}

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

                                          {/* Sub-module Expanded Content */}
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
                                                  whiteSpace: 'pre-wrap',
                                                }}
                                              >
                                                {item.summary ||
                                                  (item.importantNotes && item.importantNotes.length > 0
                                                    ? item.importantNotes.join('\n• ')
                                                    : item.content ||
                                                      `In this unit, you will study core syntax, structural paradigms, algorithmic foundations, and best practices for ${item.title}.`)}
                                              </Typography>
                                              <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                                                {!isStudent && isStudioMode && (
                                                  <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => handleOpenEditLesson(item, idx, tIdx, modTitle)}
                                                    startIcon={<EditRoundedIcon sx={{ fontSize: 15 }} />}
                                                    sx={{
                                                      borderColor: '#CBD5E1',
                                                      color: '#475569',
                                                      fontWeight: 700,
                                                      fontSize: '0.8rem',
                                                      textTransform: 'none',
                                                      borderRadius: '8px',
                                                      '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                                                    }}
                                                  >
                                                    Edit in Studio
                                                  </Button>
                                                )}
                                                <Tooltip title={isSubUnlocked ? 'Open interactive lesson in learning workspace' : 'Complete previous submodules to unlock'}>
                                                  <span>
                                                    <Button
                                                      size="small"
                                                      variant="text"
                                                      disabled={isEnrolling || !isSubUnlocked}
                                                      onClick={() => {
                                                        if (!isSubUnlocked) {
                                                          toast.warning('Complete previous submodules to unlock this lesson.', 'Lesson Locked');
                                                          return;
                                                        }
                                                        handleEnrollOrStart(subKey);
                                                      }}
                                                      endIcon={isSubUnlocked ? <NorthEastRoundedIcon sx={{ fontSize: 15 }} /> : <LockRoundedIcon sx={{ fontSize: 14 }} />}
                                                      sx={{
                                                        color: isSubUnlocked ? '#2563EB' : '#94A3B8',
                                                        fontWeight: 700,
                                                        fontSize: '0.8rem',
                                                        textTransform: 'none',
                                                        p: 0,
                                                        '&:hover': { bgcolor: 'transparent', color: isSubUnlocked ? '#1D4ED8' : '#94A3B8' },
                                                        '&.Mui-disabled': { color: '#94A3B8' },
                                                      }}
                                                    >
                                                      {isSubUnlocked ? 'Open Lesson in Workspace' : 'Locked'}
                                                    </Button>
                                                  </span>
                                                </Tooltip>
                                              </Box>
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
                    )}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                          {filteredStudents.length} Students Enrolled
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleExportRosterCsv}
                          disabled={isExportingRoster}
                          startIcon={
                            isExportingRoster ? (
                              <CircularProgress size={14} />
                            ) : (
                              <FileDownloadRoundedIcon sx={{ fontSize: 16 }} />
                            )
                          }
                          sx={{
                            borderRadius: '9999px',
                            borderColor: '#CBD5E1',
                            color: '#475569',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            textTransform: 'none',
                            bgcolor: '#FFFFFF',
                            '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
                          }}
                        >
                          {isExportingRoster ? 'Exporting...' : 'Export Gradebook CSV'}
                        </Button>
                      </Box>
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
                          {isRosterLoading ? (
                            <TableRow>
                              <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5, color: '#64748B' }}>
                                <CircularProgress size={24} sx={{ mb: 1 }} />
                                <Typography sx={{ fontSize: '0.85rem' }}>Loading course gradebook roster...</Typography>
                              </TableCell>
                            </TableRow>
                          ) : rosterFetchError ? (
                            <TableRow>
                              <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5, color: '#EF4444' }}>
                                <Typography sx={{ fontSize: '0.88rem', fontWeight: 600 }}>{rosterFetchError}</Typography>
                              </TableCell>
                            </TableRow>
                          ) : filteredStudents.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5, color: '#64748B' }}>
                                <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A' }}>
                                  No enrolled students found
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                                  {studentSearch ? `No students match search query "${studentSearch}".` : 'No students are currently enrolled in this curriculum.'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredStudents.map((stu) => (
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
                                  {stu.completedLessons} of {liveCourse.lessonsCount || 0} lessons complete
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
                          ))
                        )}
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
                      ID: CP-{liveCourse.code || 'CRS'}-0x8F92D
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
                    On completing all {liveCourse.modulesCount ?? liveCourse.modules?.length ?? 0} modules and lab assessments in this roadmap, you'll receive an official verified certificate.
                  </Typography>
                </Box>

                {/* Action Button */}
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() =>
                    setSelectedCert({
                      id: `cert-${liveCourse.id}`,
                      title: liveCourse.title,
                      badgeCode: liveCourse.code,
                      language: liveCourse.category,
                      stars: 3,
                      issueDate: 'Academic Term 2025',
                      issuer: 'CodePlatform Academic Board & Faculty',
                      credentialId: `CP-${liveCourse.code || 'CRS'}-${(liveCourse.id || '').slice(0, 6).toUpperCase()}`,
                      skills: liveCourse.tags,
                      score: '96%',
                      percentile: 'Top 5%',
                      proctoredBy: 'Stanford CS Evaluation Engine',
                      assessmentDuration: `${liveCourse.durationHours} Hours Total`,
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
            <Box sx={{ maxWidth: 1400, width: '100%', mx: 'auto', px: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', gap: 4, pb: { xs: 4, md: 6 } }}>
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

      {/* Superadmin Module Authoring Modal */}
      <ModuleAuthoringModal
        open={isAddModuleOpen}
        onClose={() => {
          setIsAddModuleOpen(false);
          setModuleToEdit(null);
        }}
        onSave={handleSaveModule}
        initialData={moduleToEdit}
        isEditing={Boolean(moduleToEdit?.id)}
      />

      {/* Superadmin Submodule (Lesson) Authoring Modal with Notes, MCQ, MSQ, & Coding Challenges */}
      <LessonAuthoringModal
        open={isAddLessonOpen}
        onClose={() => {
          setIsAddLessonOpen(false);
          setLessonToEdit(null);
          setTargetModuleForLesson(null);
        }}
        onSave={handleSaveLesson}
        initialData={lessonToEdit?.data}
        isEditing={Boolean(lessonToEdit?.id)}
        moduleTitle={targetModuleForLesson?.title}
      />

      {/* Superadmin Bulk Curriculum Importer (CSV, JSON, Markdown) */}
      <BulkImportCurriculumModal
        open={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        courseId={liveCourse.id || course.id}
        courseTitle={liveCourse.title || course.title}
        onImportSuccess={async () => {
          await refreshLiveCourse();
        }}
      />

      {/* Superadmin / Instructor Learning Outcomes Editor Modal */}
      <Dialog
        open={isEditOutcomesOpen}
        onClose={() => !isSavingOutcomes && setIsEditOutcomesOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              p: 1,
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
            },
          },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  bgcolor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563EB',
                }}
              >
                <LightbulbRoundedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0F172A' }}>
                  What You'll Learn Points
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Add or customize key outcomes saved to backend database
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={() => setIsEditOutcomesOpen(false)}
              disabled={isSavingOutcomes}
              sx={{ color: '#94A3B8' }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Add input */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. Master Asymptotic Big-O Analysis & Graph Algorithms..."
              value={newOutcomeText}
              onChange={(e) => setNewOutcomeText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddEditableOutcome();
                }
              }}
              disabled={isSavingOutcomes}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#F8FAFC',
                  fontSize: '0.88rem',
                },
              }}
            />
            <Button
              variant="contained"
              onClick={() => handleAddEditableOutcome()}
              disabled={!newOutcomeText.trim() || isSavingOutcomes}
              startIcon={<AddRoundedIcon />}
              sx={{
                borderRadius: '12px',
                bgcolor: '#2563EB',
                textTransform: 'none',
                fontWeight: 700,
                px: 2.2,
                py: 0.9,
                whiteSpace: 'nowrap',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
            >
              Add Point
            </Button>
          </Box>

          {/* List of current outcomes */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              p: 1.5,
              bgcolor: '#F8FAFC',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              maxHeight: 280,
              overflowY: 'auto',
            }}
          >
            {editableOutcomes.length === 0 ? (
              <Typography sx={{ fontSize: '0.84rem', color: '#94A3B8', textAlign: 'center', py: 2 }}>
                No points configured yet.
              </Typography>
            ) : (
              editableOutcomes.map((item, idx) => (
                <Box
                  key={`edit-outcome-${idx}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    p: 1.25,
                    bgcolor: '#FFFFFF',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flex: 1, minWidth: 0 }}>
                    <CheckRoundedIcon sx={{ fontSize: 18, color: '#2563EB', flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.86rem', color: '#1E293B', fontWeight: 600 }}>
                      {item}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveEditableOutcome(idx)}
                    disabled={isSavingOutcomes}
                    sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', bgcolor: '#FEE2E2' } }}
                  >
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />
                  </IconButton>
                </Box>
              ))
            )}
          </Box>

          {/* Helper / Reset controls */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              size="small"
              onClick={handleResetEditableOutcomes}
              disabled={isSavingOutcomes}
              startIcon={<RestartAltRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{ textTransform: 'none', fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}
            >
              Reset to Recommended Defaults
            </Button>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              {editableOutcomes.length} points defined
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setIsEditOutcomesOpen(false)}
            disabled={isSavingOutcomes}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              color: '#475569',
              borderColor: '#CBD5E1',
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveOutcomesToBackend}
            disabled={isSavingOutcomes}
            startIcon={isSavingOutcomes ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: '10px',
              bgcolor: '#2563EB',
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            {isSavingOutcomes ? 'Saving to Database...' : 'Save Learning Points'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Core Course Details Modal */}
      <EditCourseModal
        open={isEditCourseModalOpen}
        onClose={() => setIsEditCourseModalOpen(false)}
        course={liveCourse}
        onUpdated={(updated) => {
          setLiveCourse((prev) => ({ ...prev, ...updated }));
          refreshLiveCourse(liveCourse.id || course.id);
        }}
      />
    </>
  );
}
