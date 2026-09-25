import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import {
  CompanyTier,
  InterviewStage,
  ListCompaniesQueryDto,
  SubmitAssessmentDto,
} from './dto/interview-prep.dto.js';
import { randomUUID } from 'crypto';

export interface CompanyQuestion {
  id: string;
  slug: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  frequency: number; // Percentage 0-100
  interviewStage: InterviewStage;
  expectedMinutes: number;
  hints: string[];
}

export interface CompanyTrack {
  id: string;
  name: string;
  slug: string;
  tier: CompanyTier;
  logo: string;
  overview: string;
  difficulty: 'MEDIUM' | 'HARD' | 'VERY_HARD';
  acceptanceRate: number; // e.g. 2.4%
  rounds: { stage: InterviewStage; name: string; description: string; duration: string }[];
  focusTopics: string[];
  totalQuestions: number;
  questions: CompanyQuestion[];
}

export interface MockAssessment {
  id: string;
  title: string;
  companySlug: string;
  companyName: string;
  tier: CompanyTier;
  durationMinutes: number;
  passingScore: number;
  description: string;
  problemIds: string[];
  problems: {
    id: string;
    slug: string;
    title: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    topic: string;
    points: number;
  }[];
}

export interface AssessmentSession {
  sessionId: string;
  assessmentId: string;
  userId: string;
  startTime: number;
  durationMinutes: number;
  completed: boolean;
  score?: number;
  verdict?: 'PASSED' | 'FAILED';
  submittedAt?: number;
}

export interface InterviewGuide {
  id: string;
  title: string;
  category: 'ALGORITHM_PATTERNS' | 'SYSTEM_DESIGN' | 'BEHAVIORAL_STAR' | 'COMPLEXITY_CHEAT_SHEET';
  readingTimeMinutes: number;
  summary: string;
  content: string;
  tags: string[];
}

@Injectable()
export class InterviewPrepService {
  private readonly logger = new Logger(InterviewPrepService.name);
  private readonly activeSessions = new Map<string, AssessmentSession>(); // sessionId -> AssessmentSession

  constructor(private readonly prisma: PrismaService) {}

  private evictExpiredSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now > session.startTime + session.durationMinutes * 60 * 1000) {
        this.activeSessions.delete(sessionId);
      }
    }
  }

  private readonly companies: CompanyTrack[] = [
    {
      id: 'comp-google',
      name: 'Google',
      slug: 'google',
      tier: CompanyTier.FAANG,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
      overview: 'Google interview processes heavily emphasize algorithmic efficiency, deep graph & tree traversals, and scalable distributed system principles.',
      difficulty: 'VERY_HARD',
      acceptanceRate: 1.8,
      focusTopics: ['Graphs', 'Tree DP', 'Trie', 'Sliding Window', 'Topological Sort'],
      totalQuestions: 45,
      rounds: [
        { stage: InterviewStage.ONLINE_ASSESSMENT, name: 'Online Assessment (OA)', description: '2 Coding problems focusing on complex data structure composition.', duration: '90 Mins' },
        { stage: InterviewStage.TECHNICAL_PHONE, name: 'Technical Phone Screen', description: 'Algorithmic problem solving with focus on edge cases and optimal Big-O.', duration: '45 Mins' },
        { stage: InterviewStage.ONSITE_ALGO, name: 'Onsite Coding (3-4 Rounds)', description: 'Live coding on Google Docs/Chromebook evaluating clean abstraction.', duration: '45 Mins each' },
        { stage: InterviewStage.SYSTEM_DESIGN, name: 'System Design / Architecture', description: 'Large-scale distributed systems (e.g., YouTube, Google Drive, MapReduce).', duration: '45 Mins' },
        { stage: InterviewStage.BEHAVIORAL, name: 'Googleyness & Leadership', description: 'Navigating ambiguity, collaboration, and ethical engineering principles.', duration: '45 Mins' },
      ],
      questions: [
        { id: 'gq-1', slug: 'word-ladder-ii', title: 'Word Ladder II (Shortest Transformation Sequences)', difficulty: 'HARD', topic: 'Graphs & BFS', frequency: 96, interviewStage: InterviewStage.ONSITE_ALGO, expectedMinutes: 35, hints: ['Use bidirectional BFS for distance, then DFS for path reconstruction.'] },
        { id: 'gq-2', slug: 'robot-room-cleaner', title: 'Robot Room Cleaner (Backtracking & State Tracking)', difficulty: 'HARD', topic: 'Backtracking', frequency: 93, interviewStage: InterviewStage.ONSITE_ALGO, expectedMinutes: 30, hints: ['Maintain visited coordinates (x, y) with compass direction offsets.'] },
        { id: 'gq-3', slug: 'snapshot-array', title: 'Snapshot Array (Binary Search on Historical State)', difficulty: 'MEDIUM', topic: 'Binary Search & Maps', frequency: 91, interviewStage: InterviewStage.TECHNICAL_PHONE, expectedMinutes: 25, hints: ['Store versioned values per index using a list of pairs (snapId, val).'] },
        { id: 'gq-4', slug: 'maximum-fruits-harvested-after-at-most-k-steps', title: 'Fruit Harvest Optimization (Sliding Window)', difficulty: 'HARD', topic: 'Sliding Window', frequency: 88, interviewStage: InterviewStage.ONLINE_ASSESSMENT, expectedMinutes: 35, hints: ['Analyze turning back either left-first or right-first with coordinate window constraints.'] },
        { id: 'gq-5', slug: 'course-schedule-ii', title: 'Course Schedule II (Topological Ordering)', difficulty: 'MEDIUM', topic: 'Graph / Kahns Algorithm', frequency: 89, interviewStage: InterviewStage.ONLINE_ASSESSMENT, expectedMinutes: 25, hints: ['Calculate in-degrees of nodes and process zero in-degree vertices via BFS queue.'] },
      ],
    },
    {
      id: 'comp-amazon',
      name: 'Amazon',
      slug: 'amazon',
      tier: CompanyTier.FAANG,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
      overview: 'Amazon heavily evaluates the 16 Leadership Principles (LPs) combined with practical Tree/Graph traversal, Priority Queue scheduling, and string manipulation.',
      difficulty: 'HARD',
      acceptanceRate: 3.2,
      focusTopics: ['Priority Queue', 'BFS / DFS', 'Dynamic Programming', 'Greedy', 'System Design'],
      totalQuestions: 52,
      rounds: [
        { stage: InterviewStage.ONLINE_ASSESSMENT, name: 'Online Assessment (OA1 & OA2)', description: '2 Coding questions + Work Style Simulation evaluating Leadership Principles.', duration: '90 Mins' },
        { stage: InterviewStage.TECHNICAL_PHONE, name: 'Technical Phone Screen', description: 'Data structures, algorithm complexity, and 2 Leadership Principle scenarios.', duration: '60 Mins' },
        { stage: InterviewStage.ONSITE_ALGO, name: 'Loop Onsite (3 Coding Rounds)', description: 'Practical coding, object-oriented design, and deep LP grilling.', duration: '60 Mins each' },
        { stage: InterviewStage.SYSTEM_DESIGN, name: 'High-Level System Design', description: 'Design Amazon Locker, Flash Sale inventory system, or Video Streaming.', duration: '60 Mins' },
        { stage: InterviewStage.BEHAVIORAL, name: 'Bar Raiser Interview', description: 'Independent interviewer assessing Customer Obsession, Ownership, and Deliver Results.', duration: '60 Mins' },
      ],
      questions: [
        { id: 'amz-1', slug: 'reorganize-string', title: 'Reorganize String (Max Heap & Greedy Frequency)', difficulty: 'MEDIUM', topic: 'Heaps & Greedy', frequency: 98, interviewStage: InterviewStage.ONLINE_ASSESSMENT, expectedMinutes: 20, hints: ['Use a max-heap of character frequencies and place most frequent items alternate.'] },
        { id: 'amz-2', slug: 'rotting-oranges', title: 'Rotting Oranges (Multi-source Grid BFS)', difficulty: 'MEDIUM', topic: 'BFS / Grid', frequency: 95, interviewStage: InterviewStage.ONLINE_ASSESSMENT, expectedMinutes: 20, hints: ['Initialize queue with all initially rotten oranges and execute level-by-level BFS.'] },
        { id: 'amz-3', slug: 'trapping-rain-water', title: 'Trapping Rain Water (Two Pointers & Monotonic Stack)', difficulty: 'HARD', topic: 'Two Pointers', frequency: 94, interviewStage: InterviewStage.ONSITE_ALGO, expectedMinutes: 30, hints: ['Maintain leftMax and rightMax bounds moving inner pointers inward.'] },
        { id: 'amz-4', slug: 'lru-cache', title: 'LRU Cache Design (Doubly Linked List + HashMap)', difficulty: 'MEDIUM', topic: 'Design & Linked List', frequency: 97, interviewStage: InterviewStage.ONSITE_ALGO, expectedMinutes: 25, hints: ['Combine O(1) hash map with a doubly linked list head/tail sentinel.'] },
        { id: 'amz-5', slug: 'minimum-cost-to-connect-sticks', title: 'Minimum Cost to Connect Sticks (Min Heap Greedy)', difficulty: 'MEDIUM', topic: 'Min Heap', frequency: 87, interviewStage: InterviewStage.ONLINE_ASSESSMENT, expectedMinutes: 15, hints: ['Repeatedly extract two smallest elements from a PriorityQueue.'] },
      ],
    },
    {
      id: 'comp-meta',
      name: 'Meta',
      slug: 'meta',
      tier: CompanyTier.FAANG,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
      overview: 'Meta emphasizes extreme coding speed and bug-free implementation of 2 Medium/Hard problems in 45 minutes, with focus on Two Pointers, Trees, and Graph BFS.',
      difficulty: 'HARD',
      acceptanceRate: 2.1,
      focusTopics: ['Two Pointers', 'Binary Search', 'Tree Traversal', 'Recursion', 'Product Architecture'],
      totalQuestions: 48,
      rounds: [
        { stage: InterviewStage.TECHNICAL_PHONE, name: 'Initial Technical Screen', description: '2 Algorithmic coding problems in 45 mins using CoderPad.', duration: '45 Mins' },
        { stage: InterviewStage.ONSITE_ALGO, name: 'Onsite Coding Round 1', description: '2 LeetCode-style algorithmic challenges focusing on optimal space complexity.', duration: '45 Mins' },
        { stage: InterviewStage.ONSITE_ALGO, name: 'Onsite Coding Round 2', description: 'Complex data manipulation, Tree serialization, or Range queries.', duration: '45 Mins' },
        { stage: InterviewStage.SYSTEM_DESIGN, name: 'Product / System Design Architecture', description: 'Design News Feed, Instagram Stories, Messenger, or Proximity Search.', duration: '45 Mins' },
        { stage: InterviewStage.BEHAVIORAL, name: 'Behavioral & Meta Core Values', description: 'Move Fast, Focus on Long-Term Impact, and engineering trade-offs.', duration: '45 Mins' },
      ],
      questions: [
        { id: 'meta-1', slug: 'valid-palindrome-ii', title: 'Valid Palindrome II (Two Pointer Deviation)', difficulty: 'EASY', topic: 'Two Pointers', frequency: 95, interviewStage: InterviewStage.TECHNICAL_PHONE, expectedMinutes: 15, hints: ['When a mismatch occurs at i and j, check if substring(i+1, j) or substring(i, j-1) is a palindrome.'] },
        { id: 'meta-2', slug: 'lowest-common-ancestor-of-a-binary-tree-iii', title: 'LCA of Binary Tree with Parent Pointers', difficulty: 'MEDIUM', topic: 'Trees / Linked List Cycle', frequency: 96, interviewStage: InterviewStage.TECHNICAL_PHONE, expectedMinutes: 20, hints: ['Treat parent pointers as linked lists and find intersection point.'] },
        { id: 'meta-3', slug: 'k-closest-points-to-origin', title: 'K Closest Points to Origin (QuickSelect / Max Heap)', difficulty: 'MEDIUM', topic: 'QuickSelect & Heaps', frequency: 92, interviewStage: InterviewStage.ONSITE_ALGO, expectedMinutes: 20, hints: ['Use QuickSelect for O(N) average time or max-heap of size K.'] },
        { id: 'meta-4', slug: 'continuous-subarray-sum', title: 'Continuous Subarray Sum (Prefix Sum Modulo Hash Map)', difficulty: 'MEDIUM', topic: 'Prefix Sum & Math', frequency: 90, interviewStage: InterviewStage.ONSITE_ALGO, expectedMinutes: 25, hints: ['Track running sum modulo k in a hash map mapping mod value to first seen index.'] },
      ],
    },
    {
      id: 'comp-microsoft',
      name: 'Microsoft',
      slug: 'microsoft',
      tier: CompanyTier.BIG_TECH,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
      overview: 'Microsoft values robust coding, clean architecture, tree/string algorithms, and comprehensive discussions of testing strategies & edge cases.',
      difficulty: 'MEDIUM',
      acceptanceRate: 4.5,
      focusTopics: ['Strings', 'Binary Search Trees', 'Dynamic Programming', 'OOP Design', 'System Architecture'],
      totalQuestions: 38,
      rounds: [
        { stage: InterviewStage.ONLINE_ASSESSMENT, name: 'Codility OA Screen', description: '3 algorithmic & debugging tasks with strict execution timers.', duration: '90 Mins' },
        { stage: InterviewStage.TECHNICAL_PHONE, name: 'Technical Screening', description: 'Data structures, algorithm complexity, and engineering background.', duration: '45 Mins' },
        { stage: InterviewStage.ONSITE_ALGO, name: 'Onsite Final Loop (3 Rounds)', description: 'Live coding, object-oriented design patterns, and edge case resilience.', duration: '60 Mins each' },
        { stage: InterviewStage.BEHAVIORAL, name: 'As-Appropriate (AA) Round', description: 'Senior engineering manager assessing Growth Mindset and cultural fit.', duration: '60 Mins' },
      ],
      questions: [
        { id: 'ms-1', slug: 'string-to-integer-atoi', title: 'String to Integer (atoi with Overflow Safeguards)', difficulty: 'MEDIUM', topic: 'Strings & Math', frequency: 91, interviewStage: InterviewStage.ONLINE_ASSESSMENT, expectedMinutes: 20, hints: ['Carefully handle leading whitespace, signs, and integer 32-bit clamping.'] },
        { id: 'ms-2', slug: 'sign-of-the-product-of-an-array', title: 'Sign of the Product of an Array', difficulty: 'EASY', topic: 'Array Simulation', frequency: 89, interviewStage: InterviewStage.ONLINE_ASSESSMENT, expectedMinutes: 10, hints: ['Count negative values and return 0 immediately if any element is zero.'] },
        { id: 'ms-3', slug: 'count-good-nodes-in-binary-tree', title: 'Count Good Nodes in Binary Tree', difficulty: 'MEDIUM', topic: 'Binary Trees / DFS', frequency: 92, interviewStage: InterviewStage.ONSITE_ALGO, expectedMinutes: 20, hints: ['Pass the current path maximum value down through recursive DFS calls.'] },
      ],
    },
    {
      id: 'comp-goldman-sachs',
      name: 'Goldman Sachs',
      slug: 'goldman-sachs',
      tier: CompanyTier.FINTECH,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg',
      overview: 'Goldman Sachs technical rounds test high-precision math, probability, dynamic programming, queue buffers, and concurrency.',
      difficulty: 'HARD',
      acceptanceRate: 2.5,
      focusTopics: ['Math & Probability', 'Dynamic Programming', 'Strings & Maps', 'High-Frequency Queues'],
      totalQuestions: 40,
      rounds: [
        { stage: InterviewStage.ONLINE_ASSESSMENT, name: 'HackerRank Online Assessment', description: '2 algorithmic questions + Math & Probability aptitude quiz.', duration: '120 Mins' },
        { stage: InterviewStage.TECHNICAL_PHONE, name: 'Technical Video Screening', description: 'CoderPad algorithmic problem solving and financial systems trade-offs.', duration: '60 Mins' },
        { stage: InterviewStage.ONSITE_ALGO, name: 'Superday Interview (4-5 Rounds)', description: 'Algorithms, data structure design, multithreading, and behavioral.', duration: '45 Mins each' },
      ],
      questions: [
        { id: 'gs-1', slug: 'fraction-to-recurring-decimal', title: 'Fraction to Recurring Decimal (Long Division Hash Map)', difficulty: 'MEDIUM', topic: 'Math & Hash Map', frequency: 94, interviewStage: InterviewStage.ONLINE_ASSESSMENT, expectedMinutes: 25, hints: ['Use a hash map to record the index where remainder was first observed to insert parentheses.'] },
        { id: 'gs-2', slug: 'high-five', title: 'High Five (Top-K Scores Aggregator via Min-Heap)', difficulty: 'EASY', topic: 'Heaps & Hash Maps', frequency: 91, interviewStage: InterviewStage.ONLINE_ASSESSMENT, expectedMinutes: 15, hints: ['Group by student ID and retain only top 5 scores using a min-heap.'] },
        { id: 'gs-3', slug: 'string-compression', title: 'String Compression (Two Pointer In-Place Manipulation)', difficulty: 'MEDIUM', topic: 'Two Pointers & Strings', frequency: 89, interviewStage: InterviewStage.ONSITE_ALGO, expectedMinutes: 20, hints: ['Modify array in place with write pointer while counting consecutive char runs.'] },
      ],
    },
    {
      id: 'comp-uber',
      name: 'Uber',
      slug: 'uber',
      tier: CompanyTier.UNICORN,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png',
      overview: 'Uber focuses on spatial indexing, graph dispatch algorithms, concurrency, and real-time geospatial system design.',
      difficulty: 'VERY_HARD',
      acceptanceRate: 1.9,
      focusTopics: ['Graphs & Shortest Path', 'QuadTree / Geohash', 'Concurrency', 'Dynamic Programming'],
      totalQuestions: 34,
      rounds: [
        { stage: InterviewStage.ONLINE_ASSESSMENT, name: 'CodeSignal General Assessment', description: '4 algorithmic questions in 70 minutes (Score 800+ target).', duration: '70 Mins' },
        { stage: InterviewStage.TECHNICAL_PHONE, name: 'Technical Phone Screen', description: 'Algorithmic problem solving and concurrency principles.', duration: '60 Mins' },
        { stage: InterviewStage.ONSITE_ALGO, name: 'Virtual Onsite (4 Rounds)', description: 'Live coding (2 rounds), System Architecture (1 round), Hiring Manager (1 round).', duration: '60 Mins each' },
      ],
      questions: [
        { id: 'ub-1', slug: 'bus-routes', title: 'Bus Routes (Breadth-First Search on Route Graph)', difficulty: 'HARD', topic: 'Graphs / BFS', frequency: 94, interviewStage: InterviewStage.ONSITE_ALGO, expectedMinutes: 35, hints: ['Model each bus route as a graph node and execute BFS from all start routes.'] },
        { id: 'ub-2', slug: 'word-search-ii', title: 'Word Search II (Trie + Matrix Backtracking)', difficulty: 'HARD', topic: 'Trie & Backtracking', frequency: 92, interviewStage: InterviewStage.ONSITE_ALGO, expectedMinutes: 30, hints: ['Build a Trie of words and traverse grid with DFS, pruning paths not in Trie.'] },
      ],
    },
  ];

  private readonly assessments: MockAssessment[] = [
    {
      id: 'mock-google-oa',
      title: 'Google SWE Online Assessment Simulation',
      companySlug: 'google',
      companyName: 'Google',
      tier: CompanyTier.FAANG,
      durationMinutes: 90,
      passingScore: 75,
      description: 'Full simulation of Google SWE Online Assessment with 2 hard/medium problems under strict countdown timer.',
      problemIds: ['gq-1', 'gq-3'],
      problems: [
        { id: 'gq-3', slug: 'snapshot-array', title: 'Snapshot Array', difficulty: 'MEDIUM', topic: 'Binary Search', points: 40 },
        { id: 'gq-1', slug: 'word-ladder-ii', title: 'Word Ladder II', difficulty: 'HARD', topic: 'Graphs & BFS', points: 60 },
      ],
    },
    {
      id: 'mock-amazon-sde2',
      title: 'Amazon SDE-II Coding & LP Assessment',
      companySlug: 'amazon',
      companyName: 'Amazon',
      tier: CompanyTier.FAANG,
      durationMinutes: 70,
      passingScore: 70,
      description: 'Timed assessment testing priority queues, grid traversals, and optimal Big-O bounds.',
      problemIds: ['amz-1', 'amz-2'],
      problems: [
        { id: 'amz-1', slug: 'reorganize-string', title: 'Reorganize String', difficulty: 'MEDIUM', topic: 'Heaps & Greedy', points: 50 },
        { id: 'amz-2', slug: 'rotting-oranges', title: 'Rotting Oranges', difficulty: 'MEDIUM', topic: 'BFS / Grid', points: 50 },
      ],
    },
    {
      id: 'mock-meta-screen',
      title: 'Meta Fast-Paced Screening Simulation',
      companySlug: 'meta',
      companyName: 'Meta',
      tier: CompanyTier.FAANG,
      durationMinutes: 45,
      passingScore: 80,
      description: 'High-speed problem solving simulating Meta 45-minute technical screen with 2 questions.',
      problemIds: ['meta-1', 'meta-2'],
      problems: [
        { id: 'meta-1', slug: 'valid-palindrome-ii', title: 'Valid Palindrome II', difficulty: 'EASY', topic: 'Two Pointers', points: 40 },
        { id: 'meta-2', slug: 'lowest-common-ancestor-of-a-binary-tree-iii', title: 'LCA with Parent Pointers', difficulty: 'MEDIUM', topic: 'Trees', points: 60 },
      ],
    },
    {
      id: 'mock-goldman-quant',
      title: 'Goldman Sachs Quantitative Developer OA',
      companySlug: 'goldman-sachs',
      companyName: 'Goldman Sachs',
      tier: CompanyTier.FINTECH,
      durationMinutes: 90,
      passingScore: 70,
      description: 'Precision algorithm test covering string compression, math division, and top-k rankings.',
      problemIds: ['gs-1', 'gs-3'],
      problems: [
        { id: 'gs-3', slug: 'string-compression', title: 'String Compression', difficulty: 'MEDIUM', topic: 'Two Pointers', points: 45 },
        { id: 'gs-1', slug: 'fraction-to-recurring-decimal', title: 'Fraction to Recurring Decimal', difficulty: 'MEDIUM', topic: 'Math', points: 55 },
      ],
    },
  ];

  private readonly guides: InterviewGuide[] = [
    {
      id: 'guide-algo-patterns',
      title: 'The 14 Fundamental Algorithmic Patterns for FAANG',
      category: 'ALGORITHM_PATTERNS',
      readingTimeMinutes: 12,
      summary: 'Master Two Pointers, Sliding Window, Monotonic Stack, Top-K Elements, Fast & Slow Pointers, and Binary Search Boundaries.',
      tags: ['Algorithms', 'Data Structures', 'Patterns'],
      content: `### 1. Sliding Window
Used for contiguous sub-array or sub-string problems where you optimize time complexity from O(N^2) to O(N).
- **Core Strategy**: Expand right pointer to satisfy condition, shrink left pointer to find minimum or restore valid state.

### 2. Monotonic Stack
Used when you need the "next greater element" or "previous smaller element" in O(N) time.
- **Rule of Thumb**: For next greater element, maintain a monotonic decreasing stack from left to right.

### 3. Fast & Slow Pointers (Floyd's Cycle Finding)
Used in linked lists and arrays to detect cycles or find midpoints in O(1) space.`,
    },
    {
      id: 'guide-system-design',
      title: 'System Design Interview Playbook: From 0 to 10M Users',
      category: 'SYSTEM_DESIGN',
      readingTimeMinutes: 18,
      summary: 'Standard 4-step framework: Scope Clarification, High-Level Architecture, Deep-Dive Component Design, and Bottleneck Analysis.',
      tags: ['System Design', 'Scalability', 'Distributed Systems'],
      content: `### 4-Step System Design Framework
1. **Step 1: Clarify Requirements & Scope (5 Mins)**: Define functional requirements (post tweet, view timeline) and non-functional requirements (high availability, 100ms latency, 100M DAU).
2. **Step 2: High-Level Architecture (10 Mins)**: Draw API gateway, load balancers, application services, primary/read-replica databases, caching layer (Redis), and message queues (Kafka).
3. **Step 3: Component Deep-Dive (20 Mins)**: Database schema, fan-out on write vs fan-out on read, indexing strategy, data partitioning/sharding by userId.
4. **Step 4: Bottleneck Analysis & Wrap-Up (10 Mins)**: Single points of failure, rate limiting, cache stampede prevention, data consistency (CAP theorem).`,
    },
    {
      id: 'guide-star-behavioral',
      title: 'Mastering the STAR Framework for Tech Behavioral Rounds',
      category: 'BEHAVIORAL_STAR',
      readingTimeMinutes: 10,
      summary: 'How to structure answers for Conflict Resolution, Technical Failures, Mentorship, and High-Stakes Deadlines.',
      tags: ['Behavioral', 'Amazon LP', 'Googleyness'],
      content: `### The STAR Method
- **Situation (15%)**: Set the context. Describe the company, project, and specific technical dilemma.
- **Task (15%)**: Define your explicit responsibility and what was at risk.
- **Action (50%)**: Detail the concrete technical steps YOU took (architectural decisions, benchmark tests, stakeholder communication).
- **Result (20%)**: Quantify impact with numbers (e.g., "Reduced P99 latency by 35% and saved $40k/month in AWS egress costs").`,
    },
  ];

  /**
   * List all company tracks with optional tier and search filtering
   */
  async getCompanies(query?: ListCompaniesQueryDto): Promise<CompanyTrack[]> {
    let list = this.companies;

    if (query?.tier) {
      list = list.filter((c) => c.tier === query.tier);
    }

    if (query?.search && query.search.trim() !== '') {
      const s = query.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.focusTopics.some((t) => t.toLowerCase().includes(s)) ||
          c.questions.some((q) => q.title.toLowerCase().includes(s) || q.topic.toLowerCase().includes(s)),
      );
    }

    return list;
  }

  /**
   * Get single company track by slug
   */
  async getCompanyBySlug(slug: string): Promise<CompanyTrack> {
    const company = this.companies.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
    if (!company) {
      throw new NotFoundException(`Company track with slug "${slug}" not found.`);
    }
    return company;
  }

  /**
   * List all mock assessments
   */
  async getAssessments(companySlug?: string): Promise<MockAssessment[]> {
    if (companySlug) {
      return this.assessments.filter((a) => a.companySlug.toLowerCase() === companySlug.toLowerCase());
    }
    return this.assessments;
  }

  /**
   * Get single mock assessment by ID
   */
  async getAssessmentById(id: string): Promise<MockAssessment> {
    const assessment = this.assessments.find((a) => a.id === id);
    if (!assessment) {
      throw new NotFoundException(`Mock assessment with ID "${id}" not found.`);
    }
    return assessment;
  }

  /**
   * Start a new assessment session
   */
  async startAssessment(assessmentId: string, currentUser: CurrentUserPayload): Promise<{
    sessionId: string;
    assessment: MockAssessment;
    expiresAt: number;
  }> {
    this.evictExpiredSessions();
    const assessment = await this.getAssessmentById(assessmentId);
    const sessionId = randomUUID();
    const now = Date.now();
    const expiresAt = now + assessment.durationMinutes * 60 * 1000;

    const session: AssessmentSession = {
      sessionId,
      assessmentId: assessment.id,
      userId: currentUser.id,
      startTime: now,
      durationMinutes: assessment.durationMinutes,
      completed: false,
    };

    this.activeSessions.set(sessionId, session);
    this.logger.log(`User ${currentUser.id} started assessment "${assessment.id}" (Session: ${sessionId})`);

    return {
      sessionId,
      assessment,
      expiresAt,
    };
  }

  /**
   * Submit assessment answers and compute score
   */
  /**
   * Submit assessment answers and compute score
   */
  async submitAssessment(
    sessionId: string,
    dto: SubmitAssessmentDto,
    currentUser: CurrentUserPayload,
  ): Promise<{
    success: boolean;
    score: number;
    verdict: 'PASSED' | 'FAILED';
    totalPoints: number;
    earnedPoints: number;
    feedback: string;
  }> {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.userId !== currentUser.id) {
      throw new NotFoundException('Assessment session not found or unauthorized.');
    }

    const now = Date.now();
    if (now > session.startTime + session.durationMinutes * 60 * 1000) {
      this.activeSessions.delete(sessionId);
      throw new BadRequestException('Assessment session has expired.');
    }

    if (session.completed) {
      throw new BadRequestException('Assessment session has already been completed.');
    }

    // Reserve session before asynchronous grading queries to prevent concurrent submission races
    session.completed = true;

    try {
      const assessment = await this.getAssessmentById(session.assessmentId);
      let totalPoints = 0;
      let earnedPoints = 0;

      for (const prob of assessment.problems) {
        totalPoints += prob.points;

        // Fetch verified problem submissions for the current user during this session
        const submissions =
          (await this.prisma.submission.findMany?.({
            where: {
              userId: currentUser.id,
              problem: {
                OR: [{ id: prob.id }, { slug: prob.slug }],
              },
              createdAt: { gte: new Date(session.startTime) },
            },
          })) ?? [];

        // Select the best eligible attempt within the session
        let bestEarnedForProblem = 0;
        for (const sub of submissions) {
          let earned = 0;
          if (sub.verdict === 'ACCEPTED') {
            earned = prob.points;
          } else if (sub.totalTestCases > 0 && typeof sub.passedTestCases === 'number') {
            const pct = Math.max(0, Math.min(100, (sub.passedTestCases / sub.totalTestCases) * 100));
            earned = Math.round((pct / 100) * prob.points);
          }
          if (earned > bestEarnedForProblem) {
            bestEarnedForProblem = earned;
          }
        }

        earnedPoints += bestEarnedForProblem;
      }

      const calculatedScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      const verdict: 'PASSED' | 'FAILED' = calculatedScore >= assessment.passingScore ? 'PASSED' : 'FAILED';

      session.score = calculatedScore;
      session.verdict = verdict;
      session.submittedAt = Date.now();

      this.activeSessions.delete(sessionId);
      this.logger.log(
        `Assessment "${assessment.id}" submitted by ${currentUser.id} (Session: ${sessionId}): score=${calculatedScore}%, verdict=${verdict}`,
      );

      return {
        success: true,
        score: calculatedScore,
        verdict,
        totalPoints,
        earnedPoints,
        feedback:
          verdict === 'PASSED'
            ? `Outstanding performance! You exceeded the passing bar of ${assessment.passingScore}% for ${assessment.companyName}.`
            : `Keep practicing. The passing bar for ${assessment.companyName} is ${assessment.passingScore}%. Focus on speed and edge case coverage.`,
      };
    } catch (err) {
      // If grading fails, restore session reservation so it remains retryable
      session.completed = false;
      throw err;
    }
  }

  /**
   * List interview guides and cheat sheets
   */
  async getGuides(): Promise<InterviewGuide[]> {
    return this.guides;
  }

  /**
   * Dynamically calculate current user's interview readiness across companies
   */
  async getUserReadiness(currentUser: CurrentUserPayload): Promise<{
    overallReadinessPct: number;
    totalSolvedProblems: number;
    targetCompany: string;
    companyBreakdowns: {
      companySlug: string;
      companyName: string;
      readinessPct: number;
      solvedCount: number;
      totalCount: number;
      recommendedTopic: string;
    }[];
    strengths: string[];
    weaknesses: string[];
  }> {
    // 1. Fetch user's accepted submissions (let Prisma errors propagate)
    const userAcceptedSubmissions =
      (await this.prisma.submission.findMany?.({
        where: {
          userId: currentUser.id,
          verdict: 'ACCEPTED',
        },
        select: {
          problemId: true,
          problem: {
            select: {
              id: true,
              slug: true,
            },
          },
        },
      })) ?? [];

    const acceptedSlugSet = new Set(
      userAcceptedSubmissions
        .map((s) => s.problem?.slug)
        .filter((slug): slug is string => Boolean(slug)),
    );
    const acceptedIdSet = new Set(
      userAcceptedSubmissions
        .map((s) => s.problemId || s.problem?.id)
        .filter((id): id is string => Boolean(id)),
    );

    const distinctAcceptedProblemsCount = acceptedIdSet.size;

    // 2. Compute per-company breakdown
    const companyBreakdowns = this.companies.map((comp) => {
      const totalCount = comp.questions.length;
      const solvedCount = comp.questions.filter(
        (q) => acceptedSlugSet.has(q.slug) || acceptedIdSet.has(q.id),
      ).length;
      const readinessPct = totalCount > 0 ? Math.min(100, Math.round((solvedCount / totalCount) * 100)) : 0;

      return {
        companySlug: comp.slug,
        companyName: comp.name,
        readinessPct,
        solvedCount,
        totalCount,
        recommendedTopic: comp.focusTopics[0] || 'Dynamic Programming',
      };
    });

    const overallReadinessPct =
      companyBreakdowns.length > 0
        ? Math.round(companyBreakdowns.reduce((acc, c) => acc + c.readinessPct, 0) / companyBreakdowns.length)
        : 0;

    const sortedCompanies = [...companyBreakdowns].sort((a, b) => b.readinessPct - a.readinessPct);
    const targetCompany = sortedCompanies[0]?.companyName || 'Google';

    const solvedTopics = Array.from(
      new Set(
        this.companies
          .flatMap((c) => c.questions)
          .filter((q) => acceptedSlugSet.has(q.slug) || acceptedIdSet.has(q.id))
          .map((q) => q.topic),
      ),
    );
    const strengths = solvedTopics.slice(0, 3);

    const unsolvedTopics = Array.from(
      new Set(
        this.companies
          .flatMap((c) => c.questions)
          .filter((q) => !acceptedSlugSet.has(q.slug) && !acceptedIdSet.has(q.id))
          .map((q) => q.topic),
      ),
    );
    const weaknesses = unsolvedTopics.slice(0, 3);

    return {
      overallReadinessPct,
      totalSolvedProblems: distinctAcceptedProblemsCount,
      targetCompany,
      companyBreakdowns,
      strengths,
      weaknesses,
    };
  }
}
