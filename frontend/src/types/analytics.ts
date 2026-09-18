export type AcademicDomainTab = 
  | 'ALL'
  | 'INSTITUTES'
  | 'TOPICS'
  | 'CONTESTS'
  | 'SUBMISSIONS';

export interface AcademicKPIStats {
  activeCodersToday: number;
  activeCodersGrowth: string;
  totalProblemsSolved: number;
  solvedGrowth: string;
  placementReadinessRate: number;
  placementReadinessGrowth: string;
  avgWeeklyCodingHours: number;
  topPerformingInstitute: string;
  avgContestScore: number;
}

export interface InstituteBenchmarkEntity {
  id: string;
  code: string;
  name: string;
  tier: 'Tier 1' | 'Tier 2' | 'State University' | 'Pilot Partner';
  activeStudents: number;
  totalEnrolled: number;
  problemsSolved: number;
  avgSolvesPerStudent: number;
  placementReadyPercent: number; // e.g. 84%
  avgContestRating: number;
  topCoderName: string;
  healthStatus: 'Optimal' | 'Strong' | 'Average' | 'Needs Support';
  weeklyGrowth: number;
}

export interface DSATopicMasteryEntity {
  id: string;
  topicCode: string;
  name: string;
  category: 'Core Algorithms' | 'Data Structures' | 'Advanced DSA' | 'System Architecture';
  totalProblems: number;
  studentAttempts: number;
  successfulSolves: number;
  passRate: number; // percentage
  avgAttemptsToSolve: number; // e.g. 3.4 attempts
  frictionLevel: 'High Friction' | 'Moderate' | 'Mastered';
  primaryStumblingBlock: string;
  facultyActionNeeded: string;
}

export interface ContestPerformanceEntity {
  id: string;
  contestCode: string;
  title: string;
  dateFormatted: string;
  format: 'ICPC' | 'LeetCode' | 'AtCoder';
  registeredCount: number;
  attendedCount: number;
  turnoutPercent: number;
  avgScore: number;
  topScore: number;
  timeToFirstSolve: string;
  plagiarismSuspectCount: number;
  status: 'Completed' | 'Live Arena' | 'Scheduled';
}

export interface LanguageSubmissionEntity {
  id: string;
  language: string;
  version: string;
  submissionsCount: number;
  sharePercent: number;
  passRate: number;
  primaryErrorCode: string;
  primaryErrorDescription: string;
  avgExecutionTimeMs: number;
}

export type AnyAnalyticsRow = 
  | (InstituteBenchmarkEntity & { rowType: 'institute' })
  | (DSATopicMasteryEntity & { rowType: 'topic' })
  | (ContestPerformanceEntity & { rowType: 'contest' })
  | (LanguageSubmissionEntity & { rowType: 'submission' });
