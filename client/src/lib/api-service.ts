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
import { apiClient } from './axios';

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

/**
 * Strongly-typed Platform API Service connecting Frontend to NestJS GraphQL Backend & REST Endpoints via Axios
 */
export const apiService = {
  // ----------------------------------------------------
  // AUTHENTICATION & IDENTITY (REST)
  // ----------------------------------------------------
  async login(email: string, password: string) {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },

  async register(name: string, email: string, password: string) {
    const res = await apiClient.post('/auth/register', { name, email, password });
    return res.data;
  },

  async acceptInvitation(token: string, password: string) {
    const res = await apiClient.post('/auth/accept-invitation', { token, password });
    return res.data?.data ?? res.data;
  },

  async getProfile() {
    const res = await apiClient.get('/auth/me');
    return res.data?.data ?? res.data;
  },

  async getMe() {
    return this.getProfile();
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const res = await apiClient.post('/auth/change-password', { currentPassword, newPassword });
    return res.data?.data ?? res.data;
  },

  async generate2FASecret() {
    const res = await apiClient.post('/auth/2fa/generate');
    return res.data?.data ?? res.data;
  },

  async enable2FA(secret: string, token: string, recoveryCodes: string[]) {
    const res = await apiClient.post('/auth/2fa/enable', { secret, token, recoveryCodes });
    return res.data?.data ?? res.data;
  },

  async disable2FA(token: string) {
    const res = await apiClient.post('/auth/2fa/disable', { token });
    return res.data?.data ?? res.data;
  },

  async getPasskeys() {
    try {
      const res = await apiClient.get('/auth/passkeys');
      return res.data?.data ?? res.data ?? [];
    } catch {
      return [];
    }
  },

  async deletePasskey(id: string) {
    try {
      await apiClient.delete(`/auth/passkeys/${id}`);
      return true;
    } catch {
      return false;
    }
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
      const res = await apiClient.get(`/institutions${queryString}`);
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
      const res = await apiClient.get(`/institutions/${id}`);
      return res.data?.data ?? res.data;
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
    try {
      const res = await apiClient.post('/institutions', input);
      return res.data?.data ?? res.data;
    } catch (err: any) {
      if (err?.status) {
        throw err;
      }
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
      const res = await apiClient.patch(`/institutions/${id}`, input);
      return res.data?.data ?? res.data;
    } catch (err: any) {
      if (err?.status) {
        throw err;
      }
      const data = await fetchGraphQL<{ updateInstitution: any }>(UPDATE_INSTITUTION_MUTATION, { id, input });
      return data.updateInstitution;
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

  async deleteInstitution(id: string, options?: { purgeUsers?: boolean }) {
    try {
      const query = options?.purgeUsers ? '?purgeUsers=true' : '';
      await apiClient.delete(`/institutions/${id}${query}`);
      return true;
    } catch (networkErr: any) {
      if (networkErr?.status) {
        throw networkErr;
      }
      if (!options?.purgeUsers) {
        const data = await fetchGraphQL<{ deleteInstitution: boolean }>(DELETE_INSTITUTION_MUTATION, { id });
        return data.deleteInstitution;
      }
      throw networkErr;
    }
  },

  async deleteCollege(id: string, options?: { purgeUsers?: boolean }) {
    return this.deleteInstitution(id, options);
  },

  async addInstitutionMember(institutionId: string, input: { userId: string; role?: string }) {
    const data = await fetchGraphQL<{ addInstitutionMember: boolean }>(ADD_INSTITUTION_MEMBER_MUTATION, { institutionId, input });
    return data.addInstitutionMember;
  },

  async addCollegeMember(collegeId: string, input: { userId: string; role?: string }) {
    return this.addInstitutionMember(collegeId, input);
  },

  async removeInstitutionMember(institutionId: string, userId: string) {
    try {
      await apiClient.delete(`/institutions/${institutionId}/members/${userId}`);
      return true;
    } catch (err: any) {
      if (err?.status) {
        throw err;
      }
      const data = await fetchGraphQL<{ removeInstitutionMember: boolean }>(REMOVE_INSTITUTION_MEMBER_MUTATION, { institutionId, userId });
      return data.removeInstitutionMember;
    }
  },

  async removeCollegeMember(collegeId: string, userId: string) {
    return this.removeInstitutionMember(collegeId, userId);
  },

  async unassignUserFromInstitutions(userId: string, targetInstitutionId?: string) {
    if (targetInstitutionId) {
      await this.removeInstitutionMember(targetInstitutionId, userId);
    } else {
      const user = await this.getUserById(userId);
      if (user?.memberships && Array.isArray(user.memberships)) {
        for (const m of user.memberships) {
          const instId = m.institutionId || m.institution?.id;
          if (instId) {
            await this.removeInstitutionMember(instId, userId);
          }
        }
      }
    }
    await this.updateUser(userId, { institution: '' });
    return true;
  },

  async getInstitutionMembers(institutionId: string) {
    const res = await apiClient.get(`/institutions/${institutionId}/members`);
    return res.data?.data ?? res.data ?? [];
  },

  async getCollegeMembers(collegeId: string) {
    return this.getInstitutionMembers(collegeId);
  },

  // ----------------------------------------------------
  // BATCHES & COHORTS (REST)
  // ----------------------------------------------------
  async getBatchesByInstitution(institutionId: string) {
    const res = await apiClient.get(`/batches/institution/${institutionId}`);
    return res.data?.data ?? res.data;
  },

  async getBatchesByCollege(collegeId: string) {
    return this.getBatchesByInstitution(collegeId);
  },

  async getBatchById(id: string) {
    const res = await apiClient.get(`/batches/${id}`);
    return res.data?.data ?? res.data;
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
    const res = await apiClient.post('/batches', {
      name: input.name,
      institutionId,
      collegeId: institutionId,
      maxCapacity: input.maxCapacity,
      startDate: input.startDate,
      endDate: input.endDate,
    });
    return res.data?.data ?? res.data;
  },

  async updateBatch(id: string, input: {
    name?: string;
    maxCapacity?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
  }) {
    const res = await apiClient.patch(`/batches/${id}`, input);
    return res.data?.data ?? res.data;
  },

  async deleteBatch(id: string) {
    const res = await apiClient.delete(`/batches/${id}`);
    return res.data?.data ?? (res.data || true);
  },

  async assignStudentsToBatch(id: string, userIds: string[]) {
    const res = await apiClient.post(`/batches/${id}/students`, { userIds });
    return res.data?.data ?? res.data;
  },

  async getStudentsInBatch(id: string) {
    const res = await apiClient.get(`/batches/${id}/students`);
    return res.data?.data ?? res.data;
  },

  async removeStudentFromBatch(id: string, userId: string) {
    const res = await apiClient.delete(`/batches/${id}/students/${userId}`);
    return res.data?.data ?? (res.data || true);
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

    try {
      const res = await apiClient.patch(`/users/${id}`, payload);
      return res.data?.data ?? res.data;
    } catch (err: any) {
      if (err?.status) {
        throw err;
      }
      // Genuine network / transport failure fallback to GraphQL
      const data = await fetchGraphQL<{ updateUser: any }>(UPDATE_USER_MUTATION, { id, input: payload });
      return data.updateUser;
    }
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
    code?: string;
    category?: string;
    tags?: string[];
    points?: number;
    slug?: string;
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
    const res = await apiClient.post(`/courses/${courseId}/modules`, input);
    return res.data?.data ?? res.data;
  },

  async createCourseLesson(moduleId: string, input: { title: string; content: string; order?: number }) {
    const res = await apiClient.post(`/courses/modules/${moduleId}/lessons`, input);
    return res.data?.data ?? res.data;
  },

  async enrollInCourse(courseId: string) {
    const res = await apiClient.post(`/courses/${courseId}/enroll`, {});
    return res.data?.data ?? res.data;
  },

  async updateLessonProgress(lessonId: string, isCompleted: boolean = true) {
    const res = await apiClient.post(`/courses/lessons/${lessonId}/progress`, { isCompleted });
    return res.data?.data ?? res.data;
  },

  async getBlogs(): Promise<BlogPost[]> {
    const res = await apiClient.get('/blogs');
    const data = res.data?.data ?? res.data;
    return Array.isArray(data) ? data : (data?.items || []);
  },

  async createBlog(blogData: Partial<BlogPost>): Promise<BlogPost> {
    const res = await apiClient.post('/blogs', blogData);
    return res.data?.data ?? res.data;
  },

  async deleteBlog(id: string): Promise<boolean> {
    await apiClient.delete(`/blogs/${id}`);
    return true;
  },

  // ----------------------------------------------------
  // DAILY PROBLEM (POTD) & STREAKS
  // ----------------------------------------------------
  async getTodayPotd() {
    const res = await apiClient.get('/problems/potd/today');
    return res.data?.data ?? res.data;
  },

  async setPotd(input: { problemId: string; date?: string; bonusPoints?: number }) {
    const res = await apiClient.post('/problems/potd/set', input);
    return res.data?.data ?? res.data;
  },

  async getPotdHistory(days = 14) {
    const res = await apiClient.get(`/problems/potd/history?days=${days}`);
    return res.data?.data ?? res.data;
  },

  async getUserStreak() {
    const res = await apiClient.get('/problems/user/streak');
    return res.data?.data ?? res.data;
  },

  // ----------------------------------------------------
  // COMPARATIVE LEADERBOARDS & PLAGIARISM (REST)
  // ----------------------------------------------------
  async getCollegeLeaderboard() {
    const res = await apiClient.get('/contests/leaderboard/colleges');
    return res.data?.data ?? res.data;
  },

  async getBatchLeaderboard(institutionId: string) {
    const res = await apiClient.get(`/contests/leaderboard/batches/${institutionId}`);
    return res.data?.data ?? res.data;
  },

  async getContestMatrixLeaderboard(contestId: string) {
    const res = await apiClient.get(`/contests/${contestId}/matrix-leaderboard`);
    return res.data?.data ?? res.data;
  },

  async runPlagiarismCheck(contestId: string, threshold = 80) {
    const res = await apiClient.post(`/contests/${contestId}/plagiarism-check?threshold=${threshold}`);
    return res.data?.data ?? res.data;
  },
};
