/**
 * Contests & Competitive Leaderboard Data Models & API Operations
 */

import { deduplicatedQuery } from './client';
import {
  CONTESTS_QUERY,
  CONTEST_BY_ID_QUERY,
  CREATE_CONTEST_MUTATION,
  UPDATE_CONTEST_MUTATION,
  DELETE_CONTEST_MUTATION,
  REGISTER_FOR_CONTEST_MUTATION,
  ADD_CONTEST_PROBLEM_MUTATION,
  fetchGraphQL,
} from '@/lib/graphql';

export type ContestStatus = 'UPCOMING' | 'ACTIVE' | 'ENDED';

export interface ContestProblemMapping {
  id: string;
  contestId: string;
  problemId: string;
  points: number;
  order: number;
  problem?: {
    id: string;
    slug: string;
    title: string;
    difficulty: string;
  };
}

export interface LeaderboardRankEntry {
  rank: number;
  userId: string;
  userName: string;
  userHandle: string;
  institutionName?: string;
  score: number;
  penaltyTime: number;
  problemsSolved: number;
  problemScores?: Record<string, { points: number; attempts: number; solvedAt?: number }>;
}

export interface ContestEntity {
  id: string;
  slug: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  collegeId?: string;
  status: ContestStatus;
  participantsCount: number;
  problems?: ContestProblemMapping[];
  leaderboard?: LeaderboardRankEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export async function getContestsApi(params?: { page?: number; limit?: number; search?: string; status?: string }) {
  try {
    const data = await deduplicatedQuery<{ contests: { items: any[]; meta: any } }>(
      CONTESTS_QUERY,
      params || {},
    );
    return data.contests;
  } catch (err) {
    console.warn('API getContests fallback:', err);
    return null;
  }
}

export async function getContestByIdApi(id: string) {
  const data = await fetchGraphQL<{ contest: any }>(CONTESTY_BY_ID(id) || CONTEST_BY_ID_QUERY, { id });
  return data.contest;
}

function CONTESTY_BY_ID(id: string) {
  return CONTEST_BY_ID_QUERY;
}

export async function createContestApi(input: {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  collegeId?: string;
  isCollegeOnly?: boolean;
}) {
  const data = await fetchGraphQL<{ createContest: any }>(CREATE_CONTEST_MUTATION, { input });
  return data.createContest;
}

export async function updateContestApi(id: string, input: {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
}) {
  const data = await fetchGraphQL<{ updateContest: any }>(UPDATE_CONTEST_MUTATION, { id, input });
  return data.updateContest;
}

export async function deleteContestApi(id: string) {
  const data = await fetchGraphQL<{ deleteContest: boolean }>(DELETE_CONTEST_MUTATION, { id });
  return data.deleteContest;
}

export async function registerForContestApi(contestId: string) {
  const data = await fetchGraphQL<{ registerForContest: any }>(REGISTER_FOR_CONTEST_MUTATION, { contestId });
  return data.registerForContest;
}

export async function addContestProblemApi(contestId: string, problemId: string, points?: number, order?: number) {
  const data = await fetchGraphQL<{ addContestProblem: any }>(ADD_CONTEST_PROBLEM_MUTATION, {
    input: { contestId, problemId, points: points || 100, order: order || 0 },
  });
  return data.addContestProblem;
}
