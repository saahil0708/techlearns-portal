import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import UserDetailClient from '@/components/superadmin/users/UserDetailClient';
import { UserDirectoryEntity } from '@/components/superadmin/users/UsersDirectoryClient';
import { apiService } from '@/lib/api-service';

interface UserProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  let userName = 'User Profile';
  let userHandle = 'user';
  try {
    const liveData = await apiService.getUsers({ limit: 50 });
    const match = liveData?.items?.find((u: any) => u.id === id);
    if (match) {
      userName = match.name || match.email;
      userHandle = match.email ? match.email.split('@')[0] : 'user';
    }
  } catch (e) {
    // fallback
  }

  return {
    title: `${userName} (@${userHandle}) | User & Security Settings`,
    description: `Account details, RBAC permissions, and active sessions for ${userName}.`,
  };
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = await params;

  const liveUser = await apiService.getUserById(id);

  if (!liveUser || !liveUser.id) {
    notFound();
  }

  const user: UserDirectoryEntity = {
    id: liveUser.id,
    name: liveUser.name || 'Platform User',
    handle: liveUser.email ? liveUser.email.split('@')[0] : 'user',
    email: liveUser.email,
    role: liveUser.globalRole || 'STUDENT',
    institutionType: (liveUser.memberships?.length || liveUser.institution) ? 'Institute' : 'Independent',
    institutionName: liveUser.memberships?.[0]?.institution?.name || liveUser.memberships?.[0]?.college?.name || liveUser.institution || 'Global Platform',
    twoFactorEnabled: Boolean(liveUser.twoFactorEnabled),
    lastLoginAt: liveUser.lastLoginAt ? new Date(liveUser.lastLoginAt).toLocaleString() : 'Never',
    lastLoginIp: liveUser.lastLoginIp || 'Not recorded',
    createdAt: liveUser.createdAt ? new Date(liveUser.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Unknown',
    status: liveUser.status === 'ACTIVE' ? 'Active' : liveUser.status === 'INVITED' ? 'Invited' : 'Suspended',
    avatarColor: '#7C3AED',
  };

  const initialMemberships = Array.isArray(liveUser.memberships) && liveUser.memberships.length > 0
    ? liveUser.memberships.map((m: any) => ({
        id: m.id || `mem-${m.institutionId || 'default'}`,
        tenantName: m.institution?.name || m.college?.name || liveUser.institution || user.institutionName,
        tenantType: 'Institute' as const,
        role: m.role || liveUser.globalRole || 'FACULTY',
        domain: m.institution?.email?.split('@')[1] || m.college?.email?.split('@')[1] || 'campus.edu',
        joinedAt: m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : user.createdAt,
        status: 'Active' as const,
      }))
    : user.institutionName !== 'Global Platform'
    ? [
        {
          id: `mem-primary-${user.id}`,
          tenantName: user.institutionName,
          tenantType: user.institutionType,
          role: user.role,
          domain: 'campus.edu',
          joinedAt: user.createdAt,
          status: 'Active' as const,
        },
      ]
    : [];

  return (
    <UserDetailClient
      user={user}
      initialSecurityLogs={[]}
      initialMemberships={initialMemberships}
      initialSessions={[]}
      initialPreferences={[]}
    />
  );
}

