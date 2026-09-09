export type ContestStatus = 'LIVE' | 'UPCOMING' | 'PAST' | 'DRAFT';

export type ScoringFormat =
  | 'ICPC (Penalty Time)'
  | 'LeetCode (Score + Penalty)'
  | 'IOI (Partial Subtasks)'
  | 'AtCoder (Scored)';

export type ContestScope =
  | 'Global'
  | 'Collegiate League'
  | 'High School Invitational'
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
  prizePool?: string;
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
}
