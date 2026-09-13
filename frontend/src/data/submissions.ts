/**
 * Code Submissions & Test Runner Data Models & API Operations
 */

import { deduplicatedQuery } from './client';
import {
  SUBMISSIONS_LIST_QUERY,
  SUBMISSION_BY_ID_QUERY,
  SUBMIT_CODE_MUTATION,
  LIVE_SUBMISSIONS_QUERY,
  fetchGraphQL,
} from '@/lib/graphql';

export interface SubmissionItem {
  id: string;
  problemId: string;
  problemTitle?: string;
  userId: string;
  userName?: string;
  userHandle?: string;
  language: string;
  verdict: string;
  executionTimeMs: number;
  memoryKb: number;
  submittedAt: string;
  codeSnippet?: string;
}

export async function submitCodeApi(input: {
  problemId: string;
  language: string;
  code: string;
  contestId?: string;
}) {
  const data = await fetchGraphQL<{ submitCode: any }>(SUBMIT_CODE_MUTATION, { input });
  return data.submitCode;
}

export async function getSubmissionByIdApi(id: string) {
  const data = await fetchGraphQL<{ submission: any }>(SUBMISSION_BY_ID_QUERY, { id });
  return data.submission;
}

export async function getSubmissionsListApi(params?: {
  page?: number;
  limit?: number;
  problemId?: string;
  userId?: string;
  verdict?: string;
}) {
  try {
    const data = await deduplicatedQuery<{ submissions: { items: any[]; meta: any } }>(
      SUBMISSIONS_LIST_QUERY,
      params || {},
    );
    return data.submissions;
  } catch (err) {
    console.warn('API getSubmissionsList fallback:', err);
    return null;
  }
}

export async function getLiveSubmissionsApi() {
  try {
    const data = await deduplicatedQuery<{ liveSubmissions: any[] }>(
      LIVE_SUBMISSIONS_QUERY,
      {},
    );
    return data.liveSubmissions;
  } catch (err) {
    console.warn('API getLiveSubmissions fallback:', err);
    return [];
  }
}
