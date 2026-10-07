export interface SolvedProblemRecord {
  id: string;
  code: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  language: string;
  runtimeMs: number;
  percentile: number;
  solvedAt: string;
  testsPassed: string;
}

export interface AccreditedCourseRecord {
  id: string;
  code: string;
  title: string;
  category: string;
  hours: number;
  grade: string;
  completedDate: string;
  certificateId: string;
  instructor: string;
}

export interface ContestRecord {
  id: string;
  title: string;
  division: string;
  rank: number;
  totalParticipants: number;
  score: number;
  ratingDelta: number;
  date: string;
  percentile: number;
}

export interface CapstoneProjectRecord {
  id: string;
  title: string;
  domain: string;
  summary: string;
  stack: string[];
  metrics: string;
  evaluationScore: number;
  completionDate: string;
  verifiedBy: string;
  repositoryUrl?: string;
  liveDemoUrl?: string;
}

export interface SkillDomain {
  name: string;
  domain: string;
  level: 'Master' | 'Expert' | 'Advanced';
  score: number; // 0 - 100
  testCount: number;
  solvedCount: number;
  easy: number;
  medium: number;
  hard: number;
}
