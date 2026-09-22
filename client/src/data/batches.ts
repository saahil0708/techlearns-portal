/**
 * Batches & Student Cohorts Data Models & API Operations (Axios)
 */

import { apiClient } from '@/lib/axios';

export interface BatchEntity {
  id: string;
  name: string;
  code: string;
  collegeId: string;
  maxCapacity?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  _count?: {
    students: number;
    courses: number;
  };
}

export async function getBatchesByCollegeApi(collegeId: string) {
  const res = await apiClient.get(`/batches/college/${collegeId}`);
  return res.data?.data ?? res.data;
}

export async function getBatchByIdApi(id: string) {
  const res = await apiClient.get(`/batches/${id}`);
  return res.data?.data ?? res.data;
}

export async function createBatchApi(input: {
  name: string;
  collegeId: string;
  maxCapacity?: number;
  code?: string;
  startDate?: string;
  endDate?: string;
}) {
  const res = await apiClient.post('/batches', {
    name: input.name,
    collegeId: input.collegeId,
    code: input.code,
    maxCapacity: input.maxCapacity,
    startDate: input.startDate,
    endDate: input.endDate,
  });
  return res.data?.data ?? res.data;
}

export async function updateBatchApi(id: string, input: {
  name?: string;
  maxCapacity?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
}) {
  const res = await apiClient.patch(`/batches/${id}`, input);
  return res.data?.data ?? res.data;
}

export async function deleteBatchApi(id: string) {
  const res = await apiClient.delete(`/batches/${id}`);
  return res.data?.data ?? res.data ?? true;
}

export async function assignStudentsToBatchApi(id: string, userIds: string[]) {
  const res = await apiClient.post(`/batches/${id}/students`, { userIds });
  return res.data?.data ?? res.data;
}
