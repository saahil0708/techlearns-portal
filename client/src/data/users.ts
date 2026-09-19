/**
 * Users, RBAC & Platform Administration Data Models & API Operations
 */

import { deduplicatedQuery } from './client';
import {
  USERS_QUERY,
  USER_BY_ID_QUERY,
  CREATE_USER_MUTATION,
  UPDATE_USER_MUTATION,
  DELETE_USER_MUTATION,
  BULK_INVITE_USERS_MUTATION,
  ADMIN_METRICS_QUERY,
  ADMIN_AUDIT_LOGS_QUERY,
  fetchGraphQL,
} from '@/lib/graphql';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'PLATFORM_ADMIN'
  | 'COLLEGE_ADMIN'
  | 'FACULTY'
  | 'STUDENT';

export interface UserDirectoryEntity {
  id: string;
  name: string;
  handle: string;
  email: string;
  role: UserRole;
  institutionType: 'College' | 'School' | 'Independent';
  institutionName: string;
  twoFactorEnabled: boolean;
  lastLoginAt: string;
  lastLoginAtRaw?: string;
  lastLoginIp: string;
  createdAt: string;
  createdAtRaw?: string;
  status: 'Active' | 'Invited' | 'Suspended';
  avatarUrl?: string;
  avatarColor?: string;
}

export interface SecurityAuditLogItem {
  id: string;
  userId: string;
  action: string;
  resource: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  ipAddress: string;
  timestamp: string;
}

export async function getUsersApi(params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }) {
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
}

export async function getUserByIdApi(id: string) {
  const data = await fetchGraphQL<{ user: any }>(USER_BY_ID_QUERY, { id });
  return data.user;
}

export async function createUserApi(input: {
  name: string;
  email: string;
  password: string;
  globalRole?: string;
  status?: string;
  collegeId?: string;
}) {
  const data = await fetchGraphQL<{ createUser: any }>(CREATE_USER_MUTATION, {
    input,
  });
  return data.createUser;
}

export async function updateUserApi(id: string, input: {
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
  contestRating?: number;
  ratingTier?: string;
}) {
  const data = await fetchGraphQL<{ updateUser: any }>(UPDATE_USER_MUTATION, { id, input });
  return data.updateUser;
}

export async function deleteUserApi(id: string) {
  const data = await fetchGraphQL<{ deleteUser: boolean }>(DELETE_USER_MUTATION, { id });
  return data.deleteUser;
}

export async function bulkInviteUsersApi(input: { users: Array<{ name: string; email: string; role?: string; collegeId?: string; batchId?: string; rollNo?: string }> }) {
  const data = await fetchGraphQL<{ bulkInviteUsers: { invited: number; expiresInHours: number; invitationLinks?: Array<{ email: string; activationUrl: string }> } }>(BULK_INVITE_USERS_MUTATION, { input });
  return data.bulkInviteUsers;
}

export async function getAdminMetricsApi() {
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
}

export async function getAdminAuditLogsApi() {
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
}
