export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';
export type ProblemStatus = 'Published' | 'Draft' | 'Under Review' | 'Archived';

export type ProblemCategory =
  | 'All Topics'
  | 'Dynamic Programming'
  | 'Graph Theory & BFS/DFS'
  | 'Trees & Binary Search Trees'
  | 'Arrays & Two Pointers'
  | 'Strings & Tries'
  | 'Math & Number Theory'
  | 'Greedy & Heuristics';

export interface TestCaseSample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ProblemEntity {
  id: string;
  code: string; // e.g. "PROB-001", "LC-042"
  slug: string;
  title: string;
  category: ProblemCategory;
  difficulty: ProblemDifficulty;
  acceptanceRate: number; // e.g. 54.2 (%)
  totalSubmissions: number;
  acceptedSubmissions: number;
  testCasesCount: number; // total testcases (sample + hidden) in judge sandbox
  authorName?: string; // faculty / admin author
  tags: string[];
  status: ProblemStatus;
  points: number;
  timeLimitMs: number;
  memoryLimitMb: number;
  likes: number;
  dislikes: number;
  premium: boolean;
  companies: string[];
  statementMarkdown: string;
  constraints?: string;
  difficultyRating?: number; // CodeChef-style numeric difficulty rating (e.g. 240 to 2800)
  contestCode?: string; // e.g. "START256", "COOK130"
  subtasks?: { name: string; points: number; testCases: number }[];
  sampleTestCases: TestCaseSample[];
  hints?: string[];
  editorialMarkdown?: string;
  referenceSolution?: { language: string; code: string };
}

export interface NewProblemData {
  title: string;
  slug: string;
  code: string;
  category: ProblemCategory;
  difficulty: ProblemDifficulty;
  status: ProblemStatus;
  points: number;
  timeLimitMs: number;
  memoryLimitMb: number;
  testCasesCount?: number;
  tags: string[];
  statementMarkdown: string;
  sampleInput: string;
  sampleOutput: string;
}
