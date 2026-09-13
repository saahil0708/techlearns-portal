/**
 * Problems & Coding Exercises Data Models & API Operations
 */

import { deduplicatedQuery } from './client';
import {
  PROBLEMS_QUERY,
  PROBLEM_BY_ID_OR_SLUG_QUERY,
  PROBLEM_TEST_CASES_QUERY,
  CREATE_PROBLEM_MUTATION,
  UPDATE_PROBLEM_MUTATION,
  DELETE_PROBLEM_MUTATION,
  ADD_PROBLEM_TEST_CASE_MUTATION,
  fetchGraphQL,
} from '@/lib/graphql';

export type ProblemDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type ProblemStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

export interface TestCaseEntity {
  id: string;
  problemId: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  order: number;
}

export interface ProblemEntity {
  id: string;
  slug: string;
  title: string;
  statement: string;
  difficulty: ProblemDifficulty;
  status: ProblemStatus;
  authorId?: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  tags: string[];
  solvedCount?: number;
  acceptedCount?: number;
  submissionsCount?: number;
  acceptanceRate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getProblemsApi(params?: { page?: number; limit?: number; search?: string; difficulty?: string; status?: string }) {
  try {
    const data = await deduplicatedQuery<{ problems: { items: any[]; meta: any } }>(
      PROBLEMS_QUERY,
      params || {},
    );
    return data.problems;
  } catch (err) {
    console.warn('API getProblems fallback:', err);
    return null;
  }
}

export async function getProblemByIdOrSlugApi(idOrSlug: string) {
  const data = await fetchGraphQL<{ problem: any }>(PROBLEM_BY_ID_OR_SLUG_QUERY, { idOrSlug });
  return data.problem;
}

export async function getProblemTestCasesApi(problemId: string) {
  const data = await fetchGraphQL<{ problemTestCases: any[] }>(PROBLEM_TEST_CASES_QUERY, { problemId });
  return data.problemTestCases;
}

export async function createProblemApi(input: {
  title: string;
  statement: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  difficulty?: string;
  timeLimitMs?: number;
  memoryLimitMb?: number;
  tags?: string[];
  status?: string;
}) {
  const data = await fetchGraphQL<{ createProblem: any }>(CREATE_PROBLEM_MUTATION, { input });
  return data.createProblem;
}

export async function updateProblemApi(id: string, input: {
  title?: string;
  statement?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  difficulty?: string;
  timeLimitMs?: number;
  memoryLimitMb?: number;
  tags?: string[];
  status?: string;
}) {
  const data = await fetchGraphQL<{ updateProblem: any }>(UPDATE_PROBLEM_MUTATION, { id, input });
  return data.updateProblem;
}

export async function deleteProblemApi(id: string) {
  const data = await fetchGraphQL<{ deleteProblem: boolean }>(DELETE_PROBLEM_MUTATION, { id });
  return data.deleteProblem;
}

export async function addProblemTestCaseApi(problemId: string, input: { input: string; expectedOutput: string; isHidden?: boolean }) {
  const data = await fetchGraphQL<{ addProblemTestCase: any }>(ADD_PROBLEM_TEST_CASE_MUTATION, { problemId, input });
  return data.addProblemTestCase;
}
