/**
 * Batches & Student Cohorts Data Models & API Operations
 */

import { API_URL, getAuthHeaders } from './client';

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
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/batches/college/${collegeId}`, {
    method: 'GET',
    headers,
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch batches: HTTP ${res.status}`);
  }
  const json = await res.json();
  return json.data ?? json;
}

export async function getBatchByIdApi(id: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/batches/${id}`, {
    method: 'GET',
    headers,
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch batch: HTTP ${res.status}`);
  }
  const json = await res.json();
  return json.data ?? json;
}

export async function createBatchApi(input: {
  name: string;
  collegeId: string;
  maxCapacity?: number;
  code?: string;
  startDate?: string;
  endDate?: string;
}) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/batches`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({
      name: input.name,
      collegeId: input.collegeId,
      code: input.code,
      maxCapacity: input.maxCapacity,
      startDate: input.startDate,
      endDate: input.endDate,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(err.message || 'Failed to create batch');
  }
  const json = await res.json();
  return json.data ?? json;
}

export async function updateBatchApi(id: string, input: {
  name?: string;
  maxCapacity?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
}) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/batches/${id}`, {
    method: 'PATCH',
    headers,
    credentials: 'include',
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(err.message || 'Failed to update batch');
  }
  const json = await res.json();
  return json.data ?? json;
}

export async function deleteBatchApi(id: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/batches/${id}`, {
    method: 'DELETE',
    headers,
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(err.message || 'Failed to delete batch');
  }
  const json = await res.json();
  return json.data ?? json ?? true;
}

export async function assignStudentsToBatchApi(id: string, userIds: string[]) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/batches/${id}/students`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({ userIds }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(err.message || 'Failed to assign students');
  }
  const json = await res.json();
  return json.data ?? json;
}
