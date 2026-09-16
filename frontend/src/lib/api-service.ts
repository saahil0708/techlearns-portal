import {
  ADD_COLLEGE_MEMBER_MUTATION,
  ADD_INSTITUTION_MEMBER_MUTATION,
  ADD_CONTEST_PROBLEM_MUTATION,
  ADD_PROBLEM_TEST_CASE_MUTATION,
  ADMIN_AUDIT_LOGS_QUERY,
  ADMIN_METRICS_QUERY,
  BULK_INVITE_USERS_MUTATION,
  COLLEGE_BY_ID_QUERY,
  COLLEGES_QUERY,
  INSTITUTION_BY_ID_QUERY,
  INSTITUTIONS_QUERY,
  CONTEST_BY_ID_QUERY,
  CONTESTS_QUERY,
  COURSE_BY_ID_QUERY,
  COURSES_QUERY,
  CREATE_COLLEGE_MUTATION,
  CREATE_INSTITUTION_MUTATION,
  CREATE_CONTEST_MUTATION,
  CREATE_COURSE_MUTATION,
  CREATE_PROBLEM_MUTATION,
  CREATE_USER_MUTATION,
  DELETE_COLLEGE_MUTATION,
  DELETE_INSTITUTION_MUTATION,
  DELETE_CONTEST_MUTATION,
  DELETE_COURSE_MUTATION,
  DELETE_PROBLEM_MUTATION,
  DELETE_USER_MUTATION,
  fetchGraphQL,
  LIVE_SUBMISSIONS_QUERY,
  PROBLEM_BY_ID_OR_SLUG_QUERY,
  PROBLEM_TEST_CASES_QUERY,
  PROBLEMS_QUERY,
  REGISTER_FOR_CONTEST_MUTATION,
  REMOVE_COLLEGE_MEMBER_MUTATION,
  REMOVE_INSTITUTION_MEMBER_MUTATION,
  STUDENT_PROFILE_QUERY,
  SUBMISSION_BY_ID_QUERY,
  SUBMISSIONS_LIST_QUERY,
  SUBMIT_CODE_MUTATION,
  UPDATE_COLLEGE_MUTATION,
  UPDATE_INSTITUTION_MUTATION,
  UPDATE_CONTEST_MUTATION,
  UPDATE_COURSE_MUTATION,
  UPDATE_PROBLEM_MUTATION,
  UPDATE_USER_MUTATION,
  USER_BY_ID_QUERY,
  USERS_QUERY,
} from './graphql';
import type { BlogPost } from '@/types/blog';
import { INITIAL_BLOG_POSTS } from '@/types/blog';

// In-flight request deduplication map
const inFlightRequests = new Map<string, Promise<any>>();

/**
 * Executes a deduplicated GraphQL query (if identical query is in flight, reuses the promise)
 */
async function deduplicatedQuery<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  const key = `${query}::${JSON.stringify(variables)}`;

  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key) as Promise<T>;
  }

  const promise = fetchGraphQL<T>(query, variables)
    .finally(() => {
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, promise);
  return promise;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getAuthHeaders(explicitToken?: string): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  let token = explicitToken;

  if (!token && typeof window !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/);
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  if (!token && typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      token = cookieStore.get('access_token')?.value;
    } catch {
      // Called outside request context
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function getClientAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/);
    if (match) {
      headers['Authorization'] = `Bearer ${decodeURIComponent(match[1])}`;
    }
  }
  return headers;
}

/**
 * Strongly-typed Platform API Service connecting Frontend to NestJS GraphQL Backend & REST Endpoints
 */
export const apiService = {
  // ----------------------------------------------------
  // AUTHENTICATION & IDENTITY (REST)
  // ----------------------------------------------------
  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Invalid credentials' }));
      throw new Error(err.message || 'Login failed');
    }
    return res.json();
  },

  async register(name: string, email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(err.message || 'Registration failed');
    }
    return res.json();
  },

  async acceptInvitation(token: string, password: string) {
    const res = await fetch(`${API_URL}/auth/accept-invitation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Unable to activate invitation' }));
      throw new Error(err.message || 'Unable to activate invitation');
    }
    const json = await res.json();
    return json.data ?? json;
  },

  async getProfile() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return res.json();
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to change password' }));
      throw new Error(err.message || 'Failed to change password');
    }
    return res.json();
  },

  async generate2FASecret() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/auth/2fa/generate`, {
      method: 'POST',
      headers,
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to generate 2FA secret');
    return res.json();
  },

  async enable2FA(secret: string, token: string, recoveryCodes: string[]) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/auth/2fa/enable`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ secret, token, recoveryCodes }),
    });
    if (!res.ok) throw new Error('Failed to enable 2FA');
    return res.json();
  },

  async disable2FA(token: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/auth/2fa/disable`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ token }),
    });
    if (!res.ok) throw new Error('Failed to disable 2FA');
    return res.json();
  },

  async getPasskeys() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/auth/passkeys`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });
    if (!res.ok) return [];
    return res.json();
  },

  async deletePasskey(id: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/auth/passkeys/${id}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });
    return res.ok;
  },

  // ----------------------------------------------------
  // INSTITUTIONS & TENANTS
  // ----------------------------------------------------
  async getInstitutions(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.search?.trim()) queryParams.set('search', params.search.trim());
    if (params?.status && params.status !== 'ALL') queryParams.set('status', params.status.toUpperCase());
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/institutions${queryString}`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        const items = json.data ?? json;
        if (Array.isArray(items)) {
          return { items, meta: { totalItems: items.length } };
        }
        if (items && Array.isArray(items.items)) {
          return items;
        }
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

      const data = await deduplicatedQuery<{ institutions: { items: any[]; meta: any } }>(
        INSTITUTIONS_QUERY,
        cleanParams,
      );
      return data.institutions;
    } catch (err) {
      console.warn('API getInstitutions fallback:', err);
      return null;
    }
  },

  async getColleges(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    return this.getInstitutions(params);
  },

  async getInstitutionById(id: string) {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/institutions/${id}`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        return json.data ?? json;
      }
    } catch {
      // Fallback to GraphQL
    }
    try {
      const data = await fetchGraphQL<{ institution: any }>(INSTITUTION_BY_ID_QUERY, { id });
      return data.institution;
    } catch (err) {
      console.warn(`API getInstitutionById fallback failed for ${id}:`, err);
      return null;
    }
  },

  async getCollegeById(id: string) {
    return this.getInstitutionById(id);
  },

  async createInstitution(input: {
    name: string;
    code: string;
    email?: string;
    phone?: string;
    address?: string;
    tier?: string;
    quota?: number;
    status?: string;
  }) {
    let isNetworkError = false;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/institutions`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(input),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data ?? json;
      }
      const err = await res.json().catch(() => ({ message: `HTTP ${res.status} error` }));
      throw new Error(err.message || 'Failed to create institution');
    } catch (err: any) {
      if (err?.message && !err.message.includes('Failed to create institution') && !err.message.includes('HTTP')) {
        isNetworkError = true;
      } else {
        throw err;
      }
    }
    if (isNetworkError) {
      const data = await fetchGraphQL<{ createInstitution: any }>(CREATE_INSTITUTION_MUTATION, { input });
      return data.createInstitution;
    }
  },

  async createCollege(input: {
    name: string;
    code: string;
    email?: string;
    phone?: string;
    address?: string;
    tier?: string;
    quota?: number;
    status?: string;
  }) {
    return this.createInstitution(input);
  },

  async updateInstitution(id: string, input: {
    name?: string;
    code?: string;
    email?: string;
    phone?: string;
    address?: string;
    tier?: string;
    quota?: number;
    status?: string;
  }) {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/institutions/${id}`, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify(input),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data ?? json;
      }
      const err = await res.json().catch(() => ({ message: `HTTP ${res.status} error` }));
      throw new Error(err.message || 'Failed to update institution');
    } catch (err: any) {
      if (err?.message && !err.message.includes('HTTP') && !err.message.includes('Failed to update institution')) {
        // Fallback to GraphQL
        const data = await fetchGraphQL<{ updateInstitution: any }>(UPDATE_INSTITUTION_MUTATION, { id, input });
        return data.updateInstitution;
      }
      throw err;
    }
  },

  async updateCollege(id: string, input: {
    name?: string;
    code?: string;
    email?: string;
    phone?: string;
    address?: string;
    tier?: string;
    quota?: number;
    status?: string;
  }) {
    return this.updateInstitution(id, input);
  },

  async deleteInstitution(id: string) {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/institutions/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });
      if (res.ok) return true;
      const err = await res.json().catch(() => ({ message: `HTTP ${res.status} error` }));
      throw new Error(err.message || 'Failed to delete institution');
    } catch (err: any) {
      if (err?.message && !err.message.includes('HTTP') && !err.message.includes('Failed to delete institution')) {
        const data = await fetchGraphQL<{ deleteInstitution: boolean }>(DELETE_INSTITUTION_MUTATION, { id });
        return data.deleteInstitution;
      }
      throw err;
    }
  },

  async deleteCollege(id: string) {
    return this.deleteInstitution(id);
  },

  async addInstitutionMember(institutionId: string, input: { userId: string; role?: string }) {
    const data = await fetchGraphQL<{ addInstitutionMember: boolean }>(ADD_INSTITUTION_MEMBER_MUTATION, { institutionId, input });
    return data.addInstitutionMember;
  },

  async addCollegeMember(collegeId: string, input: { userId: string; role?: string }) {
    return this.addInstitutionMember(collegeId, input);
  },

  async removeInstitutionMember(institutionId: string, userId: string) {
    const data = await fetchGraphQL<{ removeInstitutionMember: boolean }>(REMOVE_INSTITUTION_MEMBER_MUTATION, { institutionId, userId });
    return data.removeInstitutionMember;
  },

  async removeCollegeMember(collegeId: string, userId: string) {
    return this.removeInstitutionMember(collegeId, userId);
  },

  async getInstitutionMembers(institutionId: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/institutions/${institutionId}/members`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch institution members: HTTP ${res.status}`);
    }
    const json = await res.json();
    return json.data ?? json ?? [];
  },

  async getCollegeMembers(collegeId: string) {
    return this.getInstitutionMembers(collegeId);
  },

  // ----------------------------------------------------
  // BATCHES & COHORTS (REST)
  // ----------------------------------------------------
  async getBatchesByInstitution(institutionId: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/batches/institution/${institutionId}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch batches: HTTP ${res.status}`);
    }
    const json = await res.json();
    return json.data ?? json;
  },

  async getBatchesByCollege(collegeId: string) {
    return this.getBatchesByInstitution(collegeId);
  },

  async getBatchById(id: string) {
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
  },

  async createBatch(input: {
    name: string;
    institutionId?: string;
    collegeId?: string;
    maxCapacity?: number;
    code?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const institutionId = input.institutionId || input.collegeId;
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/batches`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        name: input.name,
        institutionId,
        collegeId: institutionId,
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
  },

  async updateBatch(id: string, input: {
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
  },

  async deleteBatch(id: string) {
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
  },

  async assignStudentsToBatch(id: string, userIds: string[]) {
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
  },

  async getStudentsInBatch(id: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/batches/${id}/students`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch students in batch: HTTP ${res.status}`);
    }
    const json = await res.json();
    return json.data ?? json;
  },

  async removeStudentFromBatch(id: string, userId: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/batches/${id}/students/${userId}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
      throw new Error(err.message || 'Failed to remove student from batch');
    }
    const json = await res.json();
    return json.data ?? json ?? true;
  },

  // ----------------------------------------------------
  // USERS & IDENTITY
  // ----------------------------------------------------
  async getUsers(params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }) {
    try {
      const cleanParams: Record<string, any> = {};
      if (params?.page) cleanParams.page = params.page;
      if (params?.limit) cleanParams.limit = params.limit;
      if (params?.search?.trim()) cleanParams.search = params.search.trim();
      if (params?.role && params.role !== 'ALL') cleanParams.role = params.role.toUpperCase();
      if (params?.status && params.status !== 'ALL') cleanParams.status = params.status.toUpperCase();

      const data = await deduplicatedQuery<{ users: { items: any[]; meta: any } }>(
        USERS_QUERY,
        cleanParams,
      );
      return data.users;
    } catch (err) {
      console.warn('API getUsers fallback:', err);
      return null;
    }
  },

  async getUserById(id: string) {
    const data = await fetchGraphQL<{ user: any }>(USER_BY_ID_QUERY, { id });
    return data.user;
  },

  async createUser(input: {
    name: string;
    email: string;
    password: string;
    globalRole?: string;
    status?: string;
    institutionId?: string;
    collegeId?: string;
    rollNo?: string;
    handle?: string;
    username?: string;
  }) {
    const institutionId = input.institutionId || input.collegeId;
    const rollNo = input.rollNo || input.handle || input.username;
    const data = await fetchGraphQL<{ createUser: any }>(CREATE_USER_MUTATION, {
      input: {
        ...input,
        rollNo,
        institutionId,
        collegeId: institutionId,
      },
    });
    return data.createUser;
  },

  async updateUser(id: string, input: {
    name?: string;
    email?: string;
    password?: string;
    globalRole?: string;
    status?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    bio?: string;
    phone?: string;
    institution?: string;
    department?: string;
    specialization?: string;
    officeHours?: string;
    location?: string;
    birthDate?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    websiteUrl?: string;
    resumeUrl?: string;
    resumeFileName?: string;
    rollNo?: string;
    handle?: string;
    username?: string;
    contestRating?: number;
    ratingTier?: string;
  }) {
    const rollNo = input.rollNo !== undefined ? input.rollNo : (input.handle !== undefined ? input.handle : input.username);
    const payload = {
      ...input,
      ...(rollNo !== undefined ? { rollNo } : {}),
    };
    const data = await fetchGraphQL<{ updateUser: any }>(UPDATE_USER_MUTATION, { id, input: payload });
    return data.updateUser;
  },

  async getStudentProfile(handleOrId: string) {
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
  },

  async getAdminMetrics() {
    try {
      const data = await deduplicatedQuery<{ adminMetrics: any }>(
        ADMIN_METRICS_QUERY,
        {},
      );
      return data.adminMetrics;
    } catch (err) {
      console.warn('API getAdminMetrics fallback:', err);
      return null;
    }
  },

  async getAdminAuditLogs() {
    try {
      const data = await deduplicatedQuery<{ adminAuditLogs: any[] }>(
        ADMIN_AUDIT_LOGS_QUERY,
        {},
      );
      return data.adminAuditLogs;
    } catch (err) {
      console.warn('API getAdminAuditLogs fallback:', err);
      return [];
    }
  },

  async deleteUser(id: string) {
    const data = await fetchGraphQL<{ deleteUser: boolean }>(DELETE_USER_MUTATION, { id });
    return data.deleteUser;
  },

  async bulkInviteUsers(input: { users: Array<{ name: string; email: string; role?: string; institutionId?: string; collegeId?: string; batchId?: string; rollNo?: string }> }) {
    const normalizedInput = {
      users: input.users.map((u) => ({
        ...u,
        institutionId: u.institutionId || u.collegeId,
        collegeId: u.institutionId || u.collegeId,
      })),
    };
    const data = await fetchGraphQL<{ bulkInviteUsers: { invited: number; expiresInHours: number; invitationLinks?: Array<{ email: string; activationUrl: string }> } }>(BULK_INVITE_USERS_MUTATION, { input: normalizedInput });
    return data.bulkInviteUsers;
  },

  // ----------------------------------------------------
  // PROBLEMS & CODING CHALLENGES
  // ----------------------------------------------------
  async getProblems(params?: { page?: number; limit?: number; search?: string; difficulty?: string; status?: string }) {
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
  },

  async getProblemByIdOrSlug(idOrSlug: string) {
    const data = await fetchGraphQL<{ problem: any }>(PROBLEM_BY_ID_OR_SLUG_QUERY, { idOrSlug });
    return data.problem;
  },

  async getProblemTestCases(problemId: string) {
    const data = await fetchGraphQL<{ problemTestCases: any[] }>(PROBLEM_TEST_CASES_QUERY, { problemId });
    return data.problemTestCases;
  },

  async createProblem(input: {
    title: string;
    statement: string;
    inputFormat?: string;
    outputFormat?: string;
    constraints?: string;
    difficulty?: string;
    timeLimit?: number;
    memoryLimit?: number;
    status?: string;
    institutionId?: string;
    collegeId?: string;
  }) {
    const institutionId = input.institutionId || input.collegeId;
    const data = await fetchGraphQL<{ createProblem: any }>(CREATE_PROBLEM_MUTATION, {
      input: {
        ...input,
        institutionId,
        collegeId: institutionId,
      },
    });
    return data.createProblem;
  },

  async updateProblem(id: string, input: {
    title?: string;
    statement?: string;
    inputFormat?: string;
    outputFormat?: string;
    constraints?: string;
    difficulty?: string;
    timeLimit?: number;
    memoryLimit?: number;
    status?: string;
  }) {
    const data = await fetchGraphQL<{ updateProblem: any }>(UPDATE_PROBLEM_MUTATION, { id, input });
    return data.updateProblem;
  },

  async deleteProblem(id: string) {
    const data = await fetchGraphQL<{ deleteProblem: boolean }>(DELETE_PROBLEM_MUTATION, { id });
    return data.deleteProblem;
  },

  async addProblemTestCase(problemId: string, input: {
    input: string;
    expectedOutput: string;
    explanation?: string;
    isHidden?: boolean;
    order?: number;
  }) {
    const data = await fetchGraphQL<{ addProblemTestCase: any }>(ADD_PROBLEM_TEST_CASE_MUTATION, { problemId, input });
    return data.addProblemTestCase;
  },

  // ----------------------------------------------------
  // CONTESTS & TOURNAMENTS
  // ----------------------------------------------------
  async getContests(params?: { page?: number; limit?: number; search?: string; status?: string }) {
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
  },

  async getContestById(id: string) {
    const data = await fetchGraphQL<{ contest: any }>(CONTEST_BY_ID_QUERY, { id });
    return data.contest;
  },

  async createContest(input: {
    title: string;
    description?: string;
    startTime: string | Date;
    endTime: string | Date;
    status?: string;
    collegeId?: string;
  }) {
    const data = await fetchGraphQL<{ createContest: any }>(CREATE_CONTEST_MUTATION, { input });
    return data.createContest;
  },

  async updateContest(id: string, input: {
    title?: string;
    description?: string;
    startTime?: string | Date;
    endTime?: string | Date;
    status?: string;
  }) {
    const data = await fetchGraphQL<{ updateContest: any }>(UPDATE_CONTEST_MUTATION, { id, input });
    return data.updateContest;
  },

  async deleteContest(id: string) {
    const data = await fetchGraphQL<{ deleteContest: boolean }>(DELETE_CONTEST_MUTATION, { id });
    return data.deleteContest;
  },

  async addContestProblem(contestId: string, input: { problemId: string; points?: number; order?: number }) {
    const data = await fetchGraphQL<{ addContestProblem: any }>(ADD_CONTEST_PROBLEM_MUTATION, { contestId, input });
    return data.addContestProblem;
  },

  async registerForContest(contestId: string) {
    const data = await fetchGraphQL<{ registerForContest: any }>(REGISTER_FOR_CONTEST_MUTATION, { contestId });
    return data.registerForContest;
  },

  // ----------------------------------------------------
  // SUBMISSIONS & LIVE FEED
  // ----------------------------------------------------
  async getSubmissions(params?: { page?: number; limit?: number; problemId?: string; userId?: string; contestId?: string; verdict?: string; language?: string }) {
    try {
      const data = await deduplicatedQuery<{ submissions: { items: any[]; meta: any } }>(
        SUBMISSIONS_LIST_QUERY,
        params || {},
      );
      return data.submissions;
    } catch (err) {
      console.warn('API getSubmissions fallback:', err);
      return null;
    }
  },

  async getSubmissionById(id: string) {
    const data = await fetchGraphQL<{ submission: any }>(SUBMISSION_BY_ID_QUERY, { id });
    return data.submission;
  },

  async getLiveSubmissions(limit: number = 20) {
    try {
      const data = await deduplicatedQuery<{ liveSubmissions: any[] }>(
        LIVE_SUBMISSIONS_QUERY,
        { limit },
      );
      return data.liveSubmissions;
    } catch (err) {
      console.warn('API getLiveSubmissions fallback:', err);
      return null;
    }
  },

  async submitCode(input: {
    problemId: string;
    contestId?: string;
    language: string;
    sourceCode: string;
  }) {
    const data = await fetchGraphQL<{ submitCode: any }>(SUBMIT_CODE_MUTATION, { input });
    return data.submitCode;
  },

  // ----------------------------------------------------
  // COURSES & CURRICULUM
  // ----------------------------------------------------
  async getCourses(params?: { page?: number; limit?: number; search?: string; status?: string; collegeId?: string }) {
    try {
      const data = await deduplicatedQuery<{ courses: { items: any[]; meta: any } }>(
        COURSES_QUERY,
        params || {},
      );
      return data.courses;
    } catch (err) {
      console.warn('API getCourses fallback:', err);
      return null;
    }
  },

  async getCourseById(id: string) {
    const data = await fetchGraphQL<{ course: any }>(COURSE_BY_ID_QUERY, { id });
    return data.course;
  },

  async createCourse(input: {
    title: string;
    description?: string;
    collegeId?: string;
    status?: string;
  }) {
    const data = await fetchGraphQL<{ createCourse: any }>(CREATE_COURSE_MUTATION, { input });
    return data.createCourse;
  },

  async updateCourse(id: string, input: {
    title?: string;
    description?: string;
    status?: string;
  }) {
    const data = await fetchGraphQL<{ updateCourse: any }>(UPDATE_COURSE_MUTATION, { id, input });
    return data.updateCourse;
  },

  async deleteCourse(id: string) {
    const data = await fetchGraphQL<{ deleteCourse: boolean }>(DELETE_COURSE_MUTATION, { id });
    return data.deleteCourse;
  },

  async createCourseModule(courseId: string, input: { title: string; description?: string; order?: number }) {
    const res = await fetch(`${API_URL}/courses/${courseId}/modules`, {
      method: 'POST',
      headers: getClientAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to create course module');
    return res.json();
  },

  async createCourseLesson(moduleId: string, input: { title: string; content: string; order?: number }) {
    const res = await fetch(`${API_URL}/courses/modules/${moduleId}/lessons`, {
      method: 'POST',
      headers: getClientAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to create course lesson');
    return res.json();
  },

  async enrollInCourse(courseId: string) {
    const res = await fetch(`${API_URL}/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: getClientAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error('Failed to enroll in course');
    return res.json();
  },

  async updateLessonProgress(lessonId: string, isCompleted: boolean = true) {
    const res = await fetch(`${API_URL}/courses/lessons/${lessonId}/progress`, {
      method: 'POST',
      headers: getClientAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ isCompleted }),
    });
    if (!res.ok) throw new Error('Failed to update lesson progress');
    return res.json();
  },

  async getBlogs(): Promise<BlogPost[]> {
    const res = await fetch(`${API_URL}/blogs`, {
      headers: getClientAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => 'Failed to fetch blogs');
      throw new Error(errText || 'Failed to fetch blogs');
    }
    const data = await res.json();
    return Array.isArray(data) ? data : (data.items || []);
  },

  async createBlog(blogData: Partial<BlogPost>): Promise<BlogPost> {
    const res = await fetch(`${API_URL}/blogs`, {
      method: 'POST',
      headers: getClientAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(blogData),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => 'Failed to create blog');
      throw new Error(errText || 'Failed to create blog');
    }
    return res.json();
  },

  async deleteBlog(id: string): Promise<boolean> {
    const res = await fetch(`${API_URL}/blogs/${id}`, {
      method: 'DELETE',
      headers: getClientAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => 'Failed to delete blog');
      throw new Error(errText || 'Failed to delete blog');
    }
    return true;
  },
};
