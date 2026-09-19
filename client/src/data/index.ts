/**
 * Centralized Data Layer & API Service Barrel Export
 * Single entry-point for all data contracts, domain types, and backend REST/GraphQL operations.
 */

export * from './client';
export * from './auth';
export * from './faculty';
export * from './colleges';
export * from './batches';
export * from './schools';
export * from './students';
export * from './users';
export * from './problems';
export * from './courses';
export * from './contests';
export * from './submissions';

// Unified apiService aggregating all domain operations
import * as auth from './auth';
import * as colleges from './colleges';
import * as batches from './batches';
import * as users from './users';
import * as students from './students';
import * as problems from './problems';
import * as courses from './courses';
import * as contests from './contests';
import * as submissions from './submissions';

export const apiService = {
  // Authentication & Security
  login: auth.loginApi,
  register: auth.registerApi,
  getMe: auth.getMeApi,
  changePassword: auth.changePasswordApi,
  acceptInvitation: auth.acceptInvitationApi,
  generate2FASecret: auth.generate2FASecretApi,
  enable2FA: auth.enable2FAApi,
  disable2FA: auth.disable2FAApi,
  getPasskeys: auth.getPasskeysApi,
  deletePasskey: auth.deletePasskeyApi,

  // Colleges & Higher Ed
  getColleges: colleges.getCollegesApi,
  getCollegeById: colleges.getCollegeByIdApi,
  createCollege: colleges.createCollegeApi,
  updateCollege: colleges.updateCollegeApi,
  deleteCollege: colleges.deleteCollegeApi,
  addCollegeMember: colleges.addCollegeMemberApi,
  removeCollegeMember: colleges.removeCollegeMemberApi,

  // Batches & Cohorts
  getBatchesByCollege: batches.getBatchesByCollegeApi,
  getBatchById: batches.getBatchByIdApi,
  createBatch: batches.createBatchApi,
  updateBatch: batches.updateBatchApi,
  deleteBatch: batches.deleteBatchApi,
  assignStudentsToBatch: batches.assignStudentsToBatchApi,

  // Users & Admin
  getUsers: users.getUsersApi,
  getUserById: users.getUserByIdApi,
  createUser: users.createUserApi,
  updateUser: users.updateUserApi,
  deleteUser: users.deleteUserApi,
  bulkInviteUsers: users.bulkInviteUsersApi,
  getAdminMetrics: users.getAdminMetricsApi,
  getAdminAuditLogs: users.getAdminAuditLogsApi,

  // Students
  getStudentProfile: students.getStudentProfileApi,

  // Problems & Test Cases
  getProblems: problems.getProblemsApi,
  getProblemByIdOrSlug: problems.getProblemByIdOrSlugApi,
  getProblemTestCases: problems.getProblemTestCasesApi,
  createProblem: problems.createProblemApi,
  updateProblem: problems.updateProblemApi,
  deleteProblem: problems.deleteProblemApi,
  addProblemTestCase: problems.addProblemTestCaseApi,

  // Courses & Lessons
  getCourses: courses.getCoursesApi,
  getCourseBySlug: courses.getCourseBySlugApi,
  createCourse: courses.createCourseApi,
  updateCourse: courses.updateCourseApi,
  deleteCourse: courses.deleteCourseApi,

  // Contests & Competitions
  getContests: contests.getContestsApi,
  getContestById: contests.getContestByIdApi,
  createContest: contests.createContestApi,
  updateContest: contests.updateContestApi,
  deleteContest: contests.deleteContestApi,
  registerForContest: contests.registerForContestApi,
  addContestProblem: contests.addContestProblemApi,

  // Code Execution & Submissions
  submitCode: submissions.submitCodeApi,
  getSubmissionById: submissions.getSubmissionByIdApi,
  getSubmissionsList: submissions.getSubmissionsListApi,
  getLiveSubmissions: submissions.getLiveSubmissionsApi,
};
