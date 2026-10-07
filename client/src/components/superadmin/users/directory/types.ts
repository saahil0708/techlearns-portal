import type { UserRole } from '@/components/superadmin/users/CreateUserModal';

export interface UserDirectoryEntity {
  id: string;
  name: string;
  handle: string;
  email: string;
  role: UserRole;
  institutionType: 'Institute' | 'Independent';
  institutionName: string;
  twoFactorEnabled: boolean;
  lastLoginAt: string;
  lastLoginAtRaw?: string;
  lastLoginIp: string;
  createdAt: string;
  createdAtRaw?: string;
  status: 'Active' | 'Invited' | 'Suspended';
  avatarUrl?: string;
  avatarColor: string;
}

export type SortField = 'name' | 'role' | 'institutionName' | 'lastLoginAt' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

export const getRoleBadgeStyle = (role: UserRole) => {
  switch (role) {
    case 'SUPER_ADMIN':
      return { bg: '#FAF5FF', text: '#7C3AED', border: '#E9D5FF' };
    case 'COLLEGE_ADMIN':
      return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
    case 'FACULTY':
      return { bg: '#ECFEFF', text: '#0891B2', border: '#A5F3FC' };
    case 'STUDENT':
      return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
    default:
      return { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' };
  }
};
