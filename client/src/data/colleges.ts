/**
 * Colleges & Higher Education Tenant Data Models & API Operations (Axios)
 */

import { deduplicatedQuery } from './client';
import { apiClient } from '@/lib/axios';
import {
  COLLEGES_QUERY,
  COLLEGE_BY_ID_QUERY,
  CREATE_COLLEGE_MUTATION,
  UPDATE_COLLEGE_MUTATION,
  DELETE_COLLEGE_MUTATION,
  ADD_COLLEGE_MEMBER_MUTATION,
  REMOVE_COLLEGE_MEMBER_MUTATION,
  fetchGraphQL,
} from '@/lib/graphql';

export interface CollegeEntity {
  id: string;
  name: string;
  code: string;
  domain: string;
  region: string;
  tier: string;
  studentsCount: number;
  maxQuota: number;
  coursesCount: number;
  cohortsCount: number;
  facultyCount: number;
  status: 'Active' | 'Suspended';
  logoColor: string;
}

export interface BatchItem {
  id: string;
  name: string;
  code: string;
  studentsCount: number;
  maxCapacity: number;
  facultyLead: string;
  coursesAssigned: number;
  year: string;
  status: string;
  avgAccuracy: string;
}

export interface StudentRosterItem {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  batch: string;
  problemsSolved: number;
  accuracy: string;
  streakDays: number;
  rank: number;
  status: 'Active' | 'Inactive';
}

export interface CourseAssignmentItem {
  id: string;
  code: string;
  title: string;
  level: string;
  facultyInstructor: string;
  batchesAssigned: string[];
  enrolledStudents: number;
  status: 'Published' | 'Draft';
}

export interface FacultyCoordinatorItem {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  batchesAssigned: string[];
  activeCourses: number;
}

export async function getCollegesApi(params?: { page?: number; limit?: number; search?: string; status?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.search?.trim()) queryParams.set('search', params.search.trim());
  if (params?.status && params.status !== 'ALL') queryParams.set('status', params.status.toUpperCase());
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  try {
    const res = await apiClient.get(`/colleges${queryString}`);
    const items = res.data?.data ?? res.data;
    if (Array.isArray(items)) {
      return { items, meta: { totalItems: items.length } };
    }
    if (items && Array.isArray(items.items)) {
      return items;
    }
  } catch {
    // Fallback to GraphQL
  }
  try {
    const cleanParams: Record<string, any> = {};
    if (params?.page) cleanParams.page = params.page;
    if (params?.limit) cleanParams.limit = params.limit;
    if (params?.search?.trim()) cleanParams.search = params.search.trim();
    if (params?.status && params.status !== 'ALL') cleanParams.status = params.status.toUpperCase();

    const data = await deduplicatedQuery<{ colleges: { items: any[]; meta: any } }>(
      COLLEGES_QUERY,
      cleanParams,
    );
    return data.colleges;
  } catch (err) {
    console.warn('API getColleges fallback:', err);
    return null;
  }
}

export async function getCollegeByIdApi(id: string) {
  try {
    const res = await apiClient.get(`/colleges/${id}`);
    return res.data?.data ?? res.data;
  } catch {
    // Fallback to GraphQL
  }
  try {
    const data = await fetchGraphQL<{ college: any }>(COLLEGE_BY_ID_QUERY, { id });
    return data.college;
  } catch (err) {
    console.warn(`API getCollegeById fallback failed for ${id}:`, err);
    return null;
  }
}

export async function createCollegeApi(input: {
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
}) {
  try {
    const res = await apiClient.post('/colleges', input);
    return res.data?.data ?? res.data;
  } catch (err: any) {
    if (err?.status) {
      throw err;
    }
    const data = await fetchGraphQL<{ createCollege: any }>(CREATE_COLLEGE_MUTATION, { input });
    return data.createCollege;
  }
}

export async function updateCollegeApi(id: string, input: {
  name?: string;
  code?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
}) {
  try {
    const res = await apiClient.patch(`/colleges/${id}`, input);
    return res.data?.data ?? res.data;
  } catch (err: any) {
    if (err?.status) {
      throw err;
    }
    const data = await fetchGraphQL<{ updateCollege: any }>(UPDATE_COLLEGE_MUTATION, { id, input });
    return data.updateCollege;
  }
}

export async function deleteCollegeApi(id: string) {
  try {
    await apiClient.delete(`/colleges/${id}`);
    return true;
  } catch (err: any) {
    if (err?.status) {
      throw err;
    }
    const data = await fetchGraphQL<{ deleteCollege: boolean }>(DELETE_COLLEGE_MUTATION, { id });
    return data.deleteCollege;
  }
}

export async function addCollegeMemberApi(collegeId: string, input: { userId: string; role?: string }) {
  const data = await fetchGraphQL<{ addCollegeMember: boolean }>(ADD_COLLEGE_MEMBER_MUTATION, { collegeId, input });
  return data.addCollegeMember;
}

export async function removeCollegeMemberApi(collegeId: string, userId: string) {
  const data = await fetchGraphQL<{ removeCollegeMember: boolean }>(REMOVE_COLLEGE_MEMBER_MUTATION, { collegeId, userId });
  return data.removeCollegeMember;
}
