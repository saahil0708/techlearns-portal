/**
 * Students Domain Data Models & API Operations
 */

import { deduplicatedQuery } from './client';
import { STUDENT_PROFILE_QUERY } from '@/lib/graphql';

export interface StudentDirectoryEntity {
  id: string;
  name: string;
  handle: string;
  email: string;
  studentId: string;
  institutionType: 'College' | 'School';
  institutionName: string;
  cohort: string;
  problemsSolved: number;
  solvedEasy: number;
  solvedMedium: number;
  solvedHard: number;
  contestRating: number;
  ratingTier: 'Newbie' | 'Pupil' | 'Apprentice' | 'Specialist' | 'Expert' | 'Candidate Master' | 'Master' | 'Grandmaster';
  globalRank: number;
  accuracy: string;
  streakDays: number;
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
  avatarColor?: string;
}

export interface StudentSubmissionEntity {
  id: string;
  problemId: string;
  problemTitle: string;
  problemSlug: string;
  language: string;
  verdict: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR';
  executionTimeMs: number;
  memoryKb: number;
  submittedAt: string;
}

export async function getStudentProfileApi(handleOrId: string) {
  try {
    const data = await deduplicatedQuery<{ studentProfile: any }>(
      STUDENT_PROFILE_QUERY,
      { handleOrId },
    );
    return data.studentProfile;
  } catch (err) {
    console.warn('API getStudentProfile fallback:', err);
    return null;
  }
}
