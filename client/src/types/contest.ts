export type ContestStatus = 'LIVE' | 'UPCOMING' | 'PAST' | 'DRAFT';

export type ScoringFormat =
  | 'ICPC (Penalty Time)'
  | 'LeetCode (Score + Penalty)'
  | 'IOI (Partial Subtasks)'
  | 'AtCoder (Scored)';

export type ContestScope =
  | 'Global'
  | 'Batch Assessment (Cohort-Specific)'
  | 'Institute League'
  | 'Institutional Invitational'
  | 'Internal Faculty Assessment';

export interface ContestEntity {
  id: string;
  code: string; // e.g. "CONTEST-101", "ICPC-2026-REG"
  slug: string;
  title: string;
  description: string;
  scope: ContestScope;
  scoringFormat: ScoringFormat;
  status: ContestStatus;
  startTime: string; // ISO 8601 string
  endTime: string; // ISO 8601 string
  durationMinutes: number;
  problemsCount: number;
  registeredParticipants: number;
  submissionsCount: number;
  organizer: string;
  bannerColor: string;
  tags: string[];
  rated: boolean;
  division?: 'Div 1' | 'Div 2' | 'Div 3' | 'Div 4' | 'All';
  ratingRange?: string;
  prizePool?: string;
  institutionId?: string;
  batchId?: string;
  batch?: { id: string; name: string };
  problemIds?: string[];
  isProctored?: boolean;
  enforceFullScreen?: boolean;
  tabSwitchLimit?: number;
  disableCopyPaste?: boolean;
  webcamProctoring?: boolean;
  audioProctoring?: boolean;
  plagiarismCheck?: boolean;
  windowType?: 'FIXED' | 'FLEXIBLE';
  shuffleQuestions?: boolean;
  ipRestriction?: string;
}

export interface NewContestData {
  title: string;
  slug: string;
  code: string;
  description: string;
  scope: ContestScope;
  scoringFormat: ScoringFormat;
  status: ContestStatus;
  startTime: string;
  durationMinutes: number;
  problemsCount: number;
  organizer: string;
  rated: boolean;
  tags: string[];
  institutionId?: string;
  batchId?: string;
  batch?: { id: string; name: string };
  problemIds?: string[];
  isProctored?: boolean;
  enforceFullScreen?: boolean;
  tabSwitchLimit?: number;
  disableCopyPaste?: boolean;
  webcamProctoring?: boolean;
  audioProctoring?: boolean;
  plagiarismCheck?: boolean;
  windowType?: 'FIXED' | 'FLEXIBLE';
  shuffleQuestions?: boolean;
  ipRestriction?: string;
}
